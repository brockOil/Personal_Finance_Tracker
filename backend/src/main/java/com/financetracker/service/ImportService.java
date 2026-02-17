package com.financetracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.ImportDto;
import com.financetracker.dto.TransactionDto;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.Transaction.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.api.key}")
    private String anthropicApiKey;

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-opus-4-5-20251101";

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ImportDto.ParseResponse parseAndImport(MultipartFile file) throws IOException, InterruptedException {
        String contentType = file.getContentType();
        byte[] fileBytes = file.getBytes();
        String base64Data = Base64.getEncoder().encodeToString(fileBytes);

        // Determine media type
        String mediaType;
        boolean isPdf = false;
        if (contentType != null && contentType.equals("application/pdf")) {
            mediaType = "application/pdf";
            isPdf = true;
        } else if (contentType != null && contentType.startsWith("image/")) {
            mediaType = contentType;
        } else {
            // Try to detect from filename
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (filename.endsWith(".pdf")) {
                mediaType = "application/pdf";
                isPdf = true;
            } else {
                mediaType = "image/jpeg"; // default
            }
        }

        // Build the content block
        String contentBlock;
        if (isPdf) {
            contentBlock = String.format("""
                {"type":"document","source":{"type":"base64","media_type":"%s","data":"%s"}}""",
                mediaType, base64Data);
        } else {
            contentBlock = String.format("""
                {"type":"image","source":{"type":"base64","media_type":"%s","data":"%s"}}""",
                mediaType, base64Data);
        }

        String prompt = """
            You are a financial data extractor. Analyze this bank passbook or statement and extract ALL transactions.
            
            Return ONLY a valid JSON array with no markdown, no explanation, no code blocks. Just raw JSON.
            
            Each transaction object must have exactly these fields:
            - "date": "YYYY-MM-DD" format
            - "description": brief description of the transaction
            - "amount": positive number (no currency symbols)
            - "type": either "INCOME" or "EXPENSE"
            - "category": one of: Salary, Freelance, Investment, Gift, Other Income, Housing, Food, Transport, Entertainment, Healthcare, Education, Shopping, Utilities, Insurance, Other
            
            Rules:
            - Credits/deposits = INCOME
            - Debits/withdrawals = EXPENSE
            - If date is missing, use today's date
            - If you cannot determine type, use EXPENSE
            - Return empty array [] if no transactions found
            
            Example output:
            [{"date":"2024-01-15","description":"Salary credit","amount":3000.00,"type":"INCOME","category":"Salary"},{"date":"2024-01-16","description":"Grocery store","amount":45.50,"type":"EXPENSE","category":"Food"}]
            """;

        // Build request body
        String requestBody = String.format("""
            {
                "model": "%s",
                "max_tokens": 4096,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            %s,
                            {"type":"text","text":%s}
                        ]
                    }
                ]
            }""",
            MODEL,
            contentBlock,
            objectMapper.writeValueAsString(prompt)
        );

        // Call Anthropic API
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ANTHROPIC_API_URL))
                .header("Content-Type", "application/json")
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .header("anthropic-beta", "pdfs-2024-09-25")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Anthropic API error: {} - {}", response.statusCode(), response.body());
            throw new RuntimeException("Failed to parse document. API error: " + response.statusCode());
        }

        // Parse response
        JsonNode responseJson = objectMapper.readTree(response.body());
        String extractedText = responseJson
                .path("content")
                .get(0)
                .path("text")
                .asText();

        // Clean up in case model adds markdown
        extractedText = extractedText.trim();
        if (extractedText.startsWith("```")) {
            extractedText = extractedText.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
        }

        // Parse transactions JSON
        JsonNode transactionsArray = objectMapper.readTree(extractedText);
        User user = getCurrentUser();
        List<ImportDto.ParsedTransaction> parsed = new ArrayList<>();

        for (JsonNode node : transactionsArray) {
            try {
                LocalDate date = parseDate(node.path("date").asText());
                BigDecimal amount = new BigDecimal(node.path("amount").asText());
                TransactionType type = TransactionType.valueOf(node.path("type").asText().toUpperCase());
                String category = node.path("category").asText("Other");
                String description = node.path("description").asText("");

                // Save directly to DB
                Transaction tx = Transaction.builder()
                        .amount(amount)
                        .type(type)
                        .category(category)
                        .date(date)
                        .description(description)
                        .user(user)
                        .build();
                transactionRepository.save(tx);

                parsed.add(ImportDto.ParsedTransaction.builder()
                        .amount(amount)
                        .type(type)
                        .category(category)
                        .date(date)
                        .description(description)
                        .build());

            } catch (Exception e) {
                log.warn("Skipping malformed transaction: {}", node, e);
            }
        }

        return ImportDto.ParseResponse.builder()
                .transactions(parsed)
                .count(parsed.size())
                .message(parsed.isEmpty()
                        ? "No transactions found in the document."
                        : String.format("Successfully imported %d transactions.", parsed.size()))
                .build();
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDate.now();
        String[] formats = {"yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy", "dd-MM-yyyy", "MM-dd-yyyy"};
        for (String fmt : formats) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(fmt));
            } catch (DateTimeParseException ignored) {}
        }
        return LocalDate.now();
    }
}