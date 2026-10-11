package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.dto.CreateBudgetRequest;
import com.finance.dto.UpdateBudgetRequest;
import com.finance.entity.Budget;
import com.finance.security.UserPrincipal;
import com.finance.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 预算控制器
 */
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * 获取用户的所有预算
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Budget>>> getBudgets(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Budget> budgets = budgetService.getUserBudgets(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(budgets));
    }

    /**
     * 获取预算使用情况
     */
    @GetMapping("/usage")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBudgetUsage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Map<String, Object>> usage = budgetService.getBudgetUsage(principal.getUserId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(usage));
    }

    /**
     * 创建预算
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBudgetRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        try {
            budgetService.createBudget(principal.getUserId(), request);
            return ResponseEntity.ok(ApiResponse.success("创建成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 更新预算
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody UpdateBudgetRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        boolean success = budgetService.updateBudget(id, principal.getUserId(), request);
        if (!success) {
            return ResponseEntity.status(404).body(ApiResponse.error("预算不存在或无权修改"));
        }

        return ResponseEntity.ok(ApiResponse.success("更新成功", null));
    }

    /**
     * 删除预算
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        boolean success = budgetService.deleteBudget(id, principal.getUserId());
        if (!success) {
            return ResponseEntity.status(404).body(ApiResponse.error("预算不存在或无权删除"));
        }

        return ResponseEntity.ok(ApiResponse.success("删除成功", null));
    }
}
