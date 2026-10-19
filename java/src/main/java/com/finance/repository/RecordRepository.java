package com.finance.repository;

import com.finance.entity.Record;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecordRepository extends JpaRepository<Record, String> {

    Page<Record> findByUserIdOrderByRecordDateDescCreatedAtDesc(String userId, Pageable pageable);

    Page<Record> findByUserIdAndTypeOrderByRecordDateDescCreatedAtDesc(String userId, String type, Pageable pageable);

    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.recordDate BETWEEN :startDate AND :endDate ORDER BY r.recordDate DESC, r.createdAt DESC")
    Page<Record> findByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.type = :type AND r.recordDate BETWEEN :startDate AND :endDate ORDER BY r.recordDate DESC, r.createdAt DESC")
    Page<Record> findByUserIdAndTypeAndDateRange(
            @Param("userId") String userId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.type = :type AND r.categoryId = :categoryId AND r.recordDate BETWEEN :startDate AND :endDate ORDER BY r.recordDate DESC, r.createdAt DESC")
    Page<Record> findByUserIdAndTypeAndCategoryAndDateRange(
            @Param("userId") String userId,
            @Param("type") String type,
            @Param("categoryId") String categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT r FROM Record r WHERE r.userId = :userId AND r.recordDate = :date ORDER BY r.createdAt DESC")
    List<Record> findByUserIdAndDate(@Param("userId") String userId, @Param("date") LocalDate date);

    List<Record> findByUserIdAndRecordDateBetweenOrderByRecordDate(String userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Record r WHERE r.userId = :userId AND r.categoryId = :categoryId AND r.recordDate BETWEEN :startDate AND :endDate AND r.type = 'expense'")
    BigDecimal sumAmountByUserAndCategoryAndDateRange(
            @Param("userId") String userId,
            @Param("categoryId") String categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Record> findByUserIdAndRecordDateBetween(String userId, LocalDate startDate, LocalDate endDate);
}
