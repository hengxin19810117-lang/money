package com.finance.controller;

import com.finance.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", LocalDateTime.now().toString());
        data.put("service", "财务小管家 API");
        data.put("version", "1.0.0");
        data.put("status", "running");
        return ApiResponse.success(data);
    }
}
