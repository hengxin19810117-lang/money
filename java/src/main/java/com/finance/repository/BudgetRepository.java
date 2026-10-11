package com.finance.repository;

import com.finance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {

    List<Budget> findByUserId(String userId);

    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetsByUserAndDate(@Param("userId") String userId, @Param("date") LocalDate date);

    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.categoryId = :categoryId AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findByUserIdAndCategoryIdAndDateRange(
            @Param("userId") String userId,
            @Param("categoryId") String categoryId,
            @Param("date") LocalDate date);
}
