package com.financetracker.dto;

import com.financetracker.entity.Transaction.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDto {

    @Data
    public static class CreateRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        @NotNull(message = "Type is required")
        private TransactionType type;

        @NotBlank(message = "Category is required")
        private String category;

        @NotNull(message = "Date is required")
        private LocalDate date;

        private String description;
    }

    @Data
    public static class Response {
        private Long id;
        private BigDecimal amount;
        private TransactionType type;
        private String category;
        private LocalDate date;
        private String description;

        public Response(com.financetracker.entity.Transaction t) {
            this.id = t.getId();
            this.amount = t.getAmount();
            this.type = t.getType();
            this.category = t.getCategory();
            this.date = t.getDate();
            this.description = t.getDescription();
        }
    }
}
