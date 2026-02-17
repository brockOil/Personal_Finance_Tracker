package com.financetracker.controller;

import com.financetracker.dto.ImportDto;
import com.financetracker.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping(value = "/passbook", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportDto.ParseResponse> importPassbook(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase() : "";

        boolean isImage = contentType != null && contentType.startsWith("image/");
        boolean isPdf = (contentType != null && contentType.equals("application/pdf"))
                || filename.endsWith(".pdf");

        if (!isImage && !isPdf) {
            throw new RuntimeException("Unsupported file type. Please upload an image (JPG, PNG) or PDF.");
        }

        try {
            ImportDto.ParseResponse result = importService.parseAndImport(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process file: " + e.getMessage());
        }
    }
}