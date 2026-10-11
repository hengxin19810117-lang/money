package com.finance.service;

import com.finance.dto.CreateCategoryRequest;
import com.finance.entity.Category;
import com.finance.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * 获取用户所有分类（系统+自定义）
     */
    @Transactional(readOnly = true)
    public List<Category> getUserCategories(String userId) {
        return categoryRepository.findUserCategories(userId);
    }

    /**
     * 按类型获取分类
     */
    @Transactional(readOnly = true)
    public List<Category> getCategoriesByType(String type, String userId) {
        return categoryRepository.findByTypeAndUser(type, userId);
    }

    /**
     * 创建自定义分类
     */
    @Transactional
    public Category createCategory(String userId, CreateCategoryRequest request) {
        Category category = new Category();
        category.setId("cat_" + System.currentTimeMillis());
        category.setName(request.getName());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setUserId(userId);
        category.setIsSystem(0);

        // 获取当前最大排序值
        List<Category> existingCategories = categoryRepository.findByUserIdOrderBySortOrder(userId);
        int maxSort = existingCategories.stream()
                .mapToInt(c -> c.getSortOrder() != null ? c.getSortOrder() : 0)
                .max()
                .orElse(0);
        category.setSortOrder(maxSort + 1);

        return categoryRepository.save(category);
    }

    /**
     * 删除自定义分类（系统分类不能删除）
     */
    @Transactional
    public boolean deleteCategory(String categoryId, String userId) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isEmpty()) {
            return false;
        }

        Category category = categoryOpt.get();
        // 只能删除用户自定义分类
        if (category.getIsSystem() != null && category.getIsSystem() == 1) {
            return false;
        }

        // 只能删除自己的分类
        if (!userId.equals(category.getUserId())) {
            return false;
        }

        categoryRepository.delete(category);
        return true;
    }
}
