package com.finance.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBudgetRequest {

    private BigDecimal amount;

    private String periodType;

    private LocalDate startDate;

    private LocalDate endDate;
}
