package com.finance.service;

import com.finance.dto.CreateBudgetRequest;
import com.finance.dto.UpdateBudgetRequest;
import com.finance.entity.Budget;
import com.finance.entity.Record;
import com.finance.repository.BudgetRepository;
import com.finance.repository.RecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final RecordRepository recordRepository;

    public BudgetService(BudgetRepository budgetRepository, RecordRepository recordRepository) {
        this.budgetRepository = budgetRepository;
        this.recordRepository = recordRepository;
    }

    /**
     * 获取用户的所有预算
     */
    @Transactional(readOnly = true)
    public List<Budget> getUserBudgets(String userId) {
        return budgetRepository.findByUserId(userId);
    }

    /**
     * 获取预算使用情况
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBudgetUsage(String userId, LocalDate startDate, LocalDate endDate) {
        List<Budget> budgets = budgetRepository.findActiveBudgetsByUserAndDate(userId, startDate);

        List<Map<String, Object>> usageList = new ArrayList<>();
        for (Budget budget : budgets) {
            Map<String, Object> usage = new HashMap<>();
            usage.put("budgetId", budget.getId());
            usage.put("categoryId", budget.getCategoryId());
            usage.put("budgetAmount", budget.getAmount());
            usage.put("periodType", budget.getPeriodType());

            // 计算已使用金额
            BigDecimal spentAmount = recordRepository.sumAmountByUserAndCategoryAndDateRange(
                    userId, budget.getCategoryId(), startDate, endDate);
            if (spentAmount == null) {
                spentAmount = BigDecimal.ZERO;
            }

            usage.put("spentAmount", spentAmount);
            usage.put("remainingAmount", budget.getAmount().subtract(spentAmount));
            usage.put("usagePercent", budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                    ? spentAmount.divide(budget.getAmount(), 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO);

            usageList.add(usage);
        }

        return usageList;
    }

    /**
     * 创建预算
     */
    @Transactional
    public Budget createBudget(String userId, CreateBudgetRequest request) {
        Budget budget = new Budget();
        budget.setId("budget_" + System.currentTimeMillis());
        budget.setUserId(userId);
        budget.setCategoryId(request.getCategoryId());
        budget.setAmount(request.getAmount());
        budget.setPeriodType(request.getPeriodType() != null ? request.getPeriodType() : "monthly");
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());

        return budgetRepository.save(budget);
    }

    /**
     * 更新预算
     */
    @Transactional
    public boolean updateBudget(String budgetId, String userId, UpdateBudgetRequest request) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isEmpty() || !budgetOpt.get().getUserId().equals(userId)) {
            return false;
        }

        Budget budget = budgetOpt.get();
        if (request.getAmount() != null) {
            budget.setAmount(request.getAmount());
        }
        if (request.getPeriodType() != null) {
            budget.setPeriodType(request.getPeriodType());
        }
        if (request.getStartDate() != null) {
            budget.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            budget.setEndDate(request.getEndDate());
        }

        budgetRepository.save(budget);
        return true;
    }

    /**
     * 删除预算
     */
    @Transactional
    public boolean deleteBudget(String budgetId, String userId) {
        Optional<Budget> budgetOpt = budgetRepository.findById(budgetId);
        if (budgetOpt.isEmpty() || !budgetOpt.get().getUserId().equals(userId)) {
            return false;
        }

        budgetRepository.delete(budgetOpt.get());
        return true;
    }
}
