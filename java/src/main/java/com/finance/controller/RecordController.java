package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.entity.Record;
import com.finance.security.UserPrincipal;
import com.finance.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 记账记录控制器
 */
@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    /**
     * 创建记账记录
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody Record record) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        try {
            recordService.createRecord(principal.getUserId(), record);
            return ResponseEntity.ok(ApiResponse.success("记账成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取记账记录列表（支持分页和筛选）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        Page<Record> result = recordService.getRecords(principal.getUserId(), page, pageSize, type, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 获取今日记账记录
     */
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<Record>>> getTodayRecords(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Record> records = recordService.getTodayRecords(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    /**
     * 更新记账记录
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Record record) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        boolean success = recordService.updateRecord(id, principal.getUserId(), record);
        if (!success) {
            return ResponseEntity.status(404).body(ApiResponse.error("记录不存在或无权修改"));
        }

        return ResponseEntity.ok(ApiResponse.success("更新成功", null));
    }

    /**
     * 删除记账记录
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        boolean success = recordService.deleteRecord(id, principal.getUserId());
        if (!success) {
            return ResponseEntity.status(404).body(ApiResponse.error("记录不存在或无权删除"));
        }

        return ResponseEntity.ok(ApiResponse.success("删除成功", null));
    }

    /**
     * 获取年度统计
     */
    @GetMapping("/stats/yearly")
    public ResponseEntity<ApiResponse<Object>> getYearlyStats(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Map<String, Object>> stats = recordService.getYearlyStats(principal.getUserId(), year);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * 获取月度统计
     */
    @GetMapping("/stats/monthly")
    public ResponseEntity<ApiResponse<Object>> getMonthlyStats(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Map<String, Object>> stats = recordService.getMonthlyStats(principal.getUserId(), year, month);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * 获取日度趋势
     */
    @GetMapping("/stats/daily")
    public ResponseEntity<ApiResponse<Object>> getDailyTrend(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Map<String, Object>> trend = recordService.getDailyTrend(principal.getUserId(), year, month, day);
        return ResponseEntity.ok(ApiResponse.success(trend));
    }

    /**
     * 导出数据
     */
    @GetMapping("/export")
    public ResponseEntity<ApiResponse<List<Record>>> exportRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<Record> records = recordService.exportRecords(principal.getUserId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
}
