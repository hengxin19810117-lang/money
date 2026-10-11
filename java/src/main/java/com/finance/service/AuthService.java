package com.finance.service;

import com.finance.dto.ChangePasswordRequest;
import com.finance.dto.LoginRequest;
import com.finance.dto.RegisterRequest;
import com.finance.dto.UpdateProfileRequest;
import com.finance.entity.User;
import com.finance.repository.UserRepository;
import com.finance.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 用户注册
     */
    @Transactional(rollbackFor = Exception.class)
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setId("user_" + System.currentTimeMillis());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setStatus(1);

        return userRepository.save(user);
    }

    /**
     * 用户登录
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("账号已被禁用");
        }

        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成 Token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());

        LoginResponse response = new LoginResponse();
        response.token = token;
        response.user = new UserDTO(user);
        return response;
    }

    /**
     * 获取当前用户信息
     */
    @Transactional(readOnly = true)
    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    /**
     * 根据用户名获取用户
     */
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * 更新用户资料
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        userRepository.save(user);
    }

    /**
     * 修改密码
     */
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 验证原密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * 登录响应
     */
    public static class LoginResponse {
        public String token;
        public UserDTO user;
    }

    /**
     * 用户信息 DTO
     */
    public static class UserDTO {
        public String id;
        public String username;
        public String nickname;
        public String avatar;

        public UserDTO(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.nickname = user.getNickname();
            this.avatar = user.getAvatar();
        }
    }

    /**
     * 业务异常
     */
    public static class BusinessException extends RuntimeException {
        private final String code;

        public BusinessException(String message) {
            super(message);
            this.code = "BUSINESS_ERROR";
        }

        public BusinessException(String code, String message) {
            super(message);
            this.code = code;
        }

        public String getCode() {
            return code;
        }
    }
}
