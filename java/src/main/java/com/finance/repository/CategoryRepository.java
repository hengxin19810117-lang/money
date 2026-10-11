package com.finance.repository;

import com.finance.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    @Query("SELECT c FROM Category c WHERE c.userId IS NULL OR c.userId = :userId ORDER BY c.sortOrder")
    List<Category> findUserCategories(@Param("userId") String userId);

    @Query("SELECT c FROM Category c WHERE (c.userId IS NULL OR c.userId = :userId) AND c.type = :type ORDER BY c.sortOrder")
    List<Category> findByTypeAndUser(@Param("type") String type, @Param("userId") String userId);

    @Query("SELECT c FROM Category c WHERE (c.userId IS NULL OR c.userId = :userId) AND c.userId IS NOT NULL ORDER BY c.sortOrder")
    List<Category> findCustomCategories(@Param("userId") String userId);

    List<Category> findByUserIdOrderBySortOrder(String userId);
}
