package com.div.ExpenseTracker.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequestDto {

    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private Long categoryId;
}
