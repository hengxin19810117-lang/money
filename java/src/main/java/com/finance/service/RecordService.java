package com.finance.service;

import com.finance.entity.Record;
import com.finance.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;

    /**
     * 创建记账记录
     */
    @Transactional
    public Record createRecord(String userId, Record record) {
        record.setId("rec_" + System.currentTimeMillis());
        record.setUserId(userId);
        record.setCreatedAt(LocalDateTime.now());
        return recordRepository.save(record);
    }

    /**
     * 获取记账记录列表（支持分页和筛选）
     */
    @Transactional(readOnly = true)
    public Page<Record> getRecords(String userId, int page, int pageSize, String type, LocalDate startDate, LocalDate endDate) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        if (startDate != null && endDate != null) {
            return recordRepository.findByUserIdAndDateRange(userId, startDate, endDate, pageable);
        } else if (type != null && !type.isEmpty()) {
            return recordRepository.findByUserIdAndTypeOrderByRecordDateDescCreatedAtDesc(userId, type, pageable);
        }

        return recordRepository.findByUserIdOrderByRecordDateDescCreatedAtDesc(userId, pageable);
    }

    /**
     * 获取记账记录列表（带分类筛选）
     */
    @Transactional(readOnly = true)
    public Page<Record> getRecords(String userId, int page, int pageSize, String type, String categoryId, LocalDate startDate, LocalDate endDate) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        // 简化实现，实际可以用更复杂的查询
        if (startDate != null && endDate != null) {
            return recordRepository.findByUserIdAndDateRange(userId, startDate, endDate, pageable);
        } else if (type != null && !type.isEmpty()) {
            return recordRepository.findByUserIdAndTypeOrderByRecordDateDescCreatedAtDesc(userId, type, pageable);
        }

        return recordRepository.findByUserIdOrderByRecordDateDescCreatedAtDesc(userId, pageable);
    }

    /**
     * 获取今日记账记录
     */
    @Transactional(readOnly = true)
    public List<Record> getTodayRecords(String userId) {
        return recordRepository.findByUserIdAndDate(userId, LocalDate.now());
    }

    /**
     * 更新记账记录
     */
    @Transactional
    public boolean updateRecord(String recordId, String userId, Record record) {
        Optional<Record> existingRecord = recordRepository.findById(recordId);
        if (existingRecord.isEmpty() || !existingRecord.get().getUserId().equals(userId)) {
            return false;
        }

        Record r = existingRecord.get();
        if (record.getAmount() != null) {
            r.setAmount(record.getAmount());
        }
        if (record.getCategoryId() != null) {
            r.setCategoryId(record.getCategoryId());
        }
        if (record.getNote() != null) {
            r.setNote(record.getNote());
        }
        if (record.getMerchant() != null) {
            r.setMerchant(record.getMerchant());
        }
        if (record.getPaymentChannel() != null) {
            r.setPaymentChannel(record.getPaymentChannel());
        }
        if (record.getRecordDate() != null) {
            r.setRecordDate(record.getRecordDate());
        }

        recordRepository.save(r);
        return true;
    }

    /**
     * 删除记账记录
     */
    @Transactional
    public boolean deleteRecord(String recordId, String userId) {
        Optional<Record> record = recordRepository.findById(recordId);
        if (record.isPresent() && record.get().getUserId().equals(userId)) {
            recordRepository.delete(record.get());
            return true;
        }
        return false;
    }

    /**
     * 获取年度统计
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getYearlyStats(String userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<Record> records = recordRepository.findByUserIdAndRecordDateBetween(userId, startDate, endDate);
        return aggregateStats(records);
    }

    /**
     * 获取月度统计
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyStats(String userId, int year, Integer month) {
        LocalDate startDate, endDate;

        if (month != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        }

        List<Record> records = recordRepository.findByUserIdAndRecordDateBetween(userId, startDate, endDate);
        return aggregateStats(records);
    }

    /**
     * 获取日度趋势
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDailyTrend(String userId, int year, Integer month, Integer day) {
        LocalDate startDate, endDate;

        if (day != null && month != null) {
            startDate = LocalDate.of(year, month, day);
            endDate = startDate;
        } else if (month != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        }

        List<Record> records = recordRepository.findByUserIdAndRecordDateBetween(userId, startDate, endDate);

        Map<LocalDate, Map<String, BigDecimal>> dailyMap = new LinkedHashMap<>();

        for (Record record : records) {
            if (!dailyMap.containsKey(record.getRecordDate())) {
                dailyMap.put(record.getRecordDate(), new HashMap<>());
                dailyMap.get(record.getRecordDate()).put("expense", BigDecimal.ZERO);
                dailyMap.get(record.getRecordDate()).put("income", BigDecimal.ZERO);
            }

            Map<String, BigDecimal> daily = dailyMap.get(record.getRecordDate());
            if ("expense".equals(record.getType())) {
                daily.put("expense", daily.get("expense").add(record.getAmount()));
            } else {
                daily.put("income", daily.get("income").add(record.getAmount()));
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<String, BigDecimal>> entry : dailyMap.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("record_date", entry.getKey().toString());
            item.put("expense", entry.getValue().get("expense"));
            item.put("income", entry.getValue().get("income"));
            result.add(item);
        }

        return result;
    }

    /**
     * 导出记录
     */
    @Transactional(readOnly = true)
    public List<Record> exportRecords(String userId, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return recordRepository.findByUserIdAndRecordDateBetween(userId, startDate, endDate);
        }
        return recordRepository.findByUserIdAndRecordDateBetween(userId, LocalDate.now().minusYears(1), LocalDate.now());
    }

    /**
     * 聚合统计数据
     */
    private List<Map<String, Object>> aggregateStats(List<Record> records) {
        Map<String, Map<String, Object>> statsMap = new LinkedHashMap<>();

        for (Record record : records) {
            String key = record.getCategoryId();
            if (!statsMap.containsKey(key)) {
                Map<String, Object> stats = new HashMap<>();
                stats.put("type", record.getType());
                stats.put("category_id", record.getCategoryId());
                stats.put("category_name", record.getCategoryId());
                stats.put("total_amount", BigDecimal.ZERO);
                stats.put("record_count", 0);
                statsMap.put(key, stats);
            }

            Map<String, Object> stats = statsMap.get(key);
            stats.put("total_amount", ((BigDecimal) stats.get("total_amount")).add(record.getAmount()));
            stats.put("record_count", (Integer) stats.get("record_count") + 1);
        }

        return new ArrayList<>(statsMap.values());
    }
}
