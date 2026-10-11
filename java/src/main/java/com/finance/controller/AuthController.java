package com.finance.controller;

import com.finance.dto.*;
import com.finance.entity.User;
import com.finance.security.UserPrincipal;
import com.finance.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 提供用户注册、登录、资料管理等功能
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("注册成功", null));
        } catch (AuthService.BusinessException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthService.LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthService.LoginResponse result = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("登录成功", result));
        } catch (AuthService.BusinessException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<AuthService.UserDTO>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        User user = authService.getUserById(principal.getUserId());
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("用户不存在"));
        }

        return ResponseEntity.ok(ApiResponse.success(new AuthService.UserDTO(user)));
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        try {
            authService.updateProfile(principal.getUserId(), request);
            return ResponseEntity.ok(ApiResponse.success("更新成功", null));
        } catch (AuthService.BusinessException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
        }

        try {
            authService.changePassword(principal.getUserId(), request);
            return ResponseEntity.ok(ApiResponse.success("密码修改成功", null));
        } catch (AuthService.BusinessException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
