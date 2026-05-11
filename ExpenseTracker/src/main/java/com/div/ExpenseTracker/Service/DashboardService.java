package com.div.ExpenseTracker.Service;

import com.div.ExpenseTracker.Dto.CategoryExpenseSummaryDto;
import com.div.ExpenseTracker.Dto.DashboardResponseDto;
import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Entity.TransactionType;
import com.div.ExpenseTracker.Repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardResponseDto getDashboard() {
        ProfileEntity profile = currentProfile();
        Long profileId = profile.getId();

        BigDecimal totalIncome = transactionRepository.sumAmountByProfileAndType(profileId, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumAmountByProfileAndType(profileId, TransactionType.EXPENSE);
        if (totalIncome == null) {
            totalIncome = BigDecimal.ZERO;
        }
        if (totalExpense == null) {
            totalExpense = BigDecimal.ZERO;
        }

        long incomeCount = transactionRepository.countByProfileEntity_IdAndType(profileId, TransactionType.INCOME);
        long expenseCount = transactionRepository.countByProfileEntity_IdAndType(profileId, TransactionType.EXPENSE);

        List<CategoryExpenseSummaryDto> byCategory = new ArrayList<>();
        for (Object[] row : transactionRepository.sumByCategoryForProfileAndType(profileId, TransactionType.EXPENSE)) {
            String name = row[0] != null ? row[0].toString() : "Uncategorized";
            BigDecimal total = row[1] instanceof BigDecimal bd ? bd : BigDecimal.valueOf(((Number) row[1]).doubleValue());
            byCategory.add(CategoryExpenseSummaryDto.builder()
                    .categoryName(name)
                    .totalAmount(total)
                    .build());
        }

        return DashboardResponseDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome.subtract(totalExpense))
                .incomeTransactionCount(incomeCount)
                .expenseTransactionCount(expenseCount)
                .expensesByCategory(byCategory)
                .build();
    }

    private ProfileEntity currentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof ProfileEntity profile)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return profile;
    }
}
