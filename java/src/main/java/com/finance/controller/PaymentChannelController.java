package com.finance.controller;

import com.finance.dto.ApiResponse;
import com.finance.dto.CreateChannelRequest;
import com.finance.entity.PaymentChannel;
import com.finance.security.UserPrincipal;
import com.finance.service.PaymentChannelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 支付渠道控制器
 */
@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
public class PaymentChannelController {

    private final PaymentChannelService channelService;

    /**
     * 获取支付渠道列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentChannel>>> getChannels(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        List<PaymentChannel> channels = channelService.getUserChannels(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(channels));
    }

    /**
     * 创建自定义支付渠道
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createChannel(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateChannelRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        try {
            channelService.createChannel(principal.getUserId(), request);
            return ResponseEntity.ok(ApiResponse.success("创建成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除自定义支付渠道
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChannel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        boolean success = channelService.deleteChannel(id, principal.getUserId());
        if (!success) {
            return ResponseEntity.status(404).body(ApiResponse.error("支付渠道不存在或无权删除"));
        }

        return ResponseEntity.ok(ApiResponse.success("删除成功", null));
    }
}
