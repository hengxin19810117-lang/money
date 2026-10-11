package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.dto.CreateCategoryRequest;
import com.finance.entity.Category;
import com.finance.security.UserPrincipal;
import com.finance.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 获取所有分类（系统+用户自定义）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategories(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Category> categories = categoryService.getUserCategories(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * 按类型获取分类
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<Category>>> getCategoriesByType(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String type) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Category> categories = categoryService.getCategoriesByType(type, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * 创建自定义分类
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCategoryRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        try {
            categoryService.createCategory(principal.getUserId(), request);
            return ResponseEntity.ok(ApiResponse.success("创建成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除自定义分类
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        boolean success = categoryService.deleteCategory(id, principal.getUserId());
        if (!success) {
            return ResponseEntity.status(404).body(ApiResponse.error("分类不存在或无权删除"));
        }

        return ResponseEntity.ok(ApiResponse.success("删除成功", null));
    }
}
