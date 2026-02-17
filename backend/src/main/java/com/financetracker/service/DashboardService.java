package com.financetracker.service;

import com.financetracker.dto.DashboardDto;
import com.financetracker.entity.Transaction.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public DashboardDto getSummary(Integer year, Integer month) {
        User user = getCurrentUser();

        YearMonth yearMonth = (year != null && month != null)
                ? YearMonth.of(year, month)
                : YearMonth.now();

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        BigDecimal totalIncome = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.INCOME, startDate, endDate);

        BigDecimal totalExpense = transactionRepository.sumByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.EXPENSE, startDate, endDate);

        BigDecimal balance = totalIncome.subtract(totalExpense);

        Map<String, BigDecimal> expenseByCategory = buildCategoryMap(
                transactionRepository.sumByCategoryForUserAndTypeAndDateBetween(
                        user.getId(), TransactionType.EXPENSE, startDate, endDate));

        Map<String, BigDecimal> incomeByCategory = buildCategoryMap(
                transactionRepository.sumByCategoryForUserAndTypeAndDateBetween(
                        user.getId(), TransactionType.INCOME, startDate, endDate));

        return DashboardDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .expenseByCategory(expenseByCategory)
                .incomeByCategory(incomeByCategory)
                .month(yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                .build();
    }

    private Map<String, BigDecimal> buildCategoryMap(List<Object[]> rows) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], (BigDecimal) row[1]);
        }
        return map;
    }
}
