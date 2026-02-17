package com.financetracker.dto;

import com.financetracker.entity.Transaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ImportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParsedTransaction {
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        private LocalDate date;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParseResponse {
        private List<ParsedTransaction> transactions;
        private int count;
        private String message;
    }
}