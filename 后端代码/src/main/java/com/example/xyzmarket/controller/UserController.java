package com.example.xyzmarket.controller;

import com.example.xyzmarket.common.Result;
import com.example.xyzmarket.dto.AdminSwitchDTO;
import com.example.xyzmarket.dto.CertifyDTO;
import com.example.xyzmarket.dto.UpdateProfileDTO;
import com.example.xyzmarket.dto.WxLoginDTO;
import com.example.xyzmarket.entity.Certification;
import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.service.CertificationService;
import com.example.xyzmarket.service.UserService;
import com.example.xyzmarket.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private CertificationService certificationService;

    @Autowired
    private com.example.xyzmarket.mapper.FavoriteMapper favoriteMapper;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 一键登录（仅需微信 code）
     */
    @PostMapping("/wxLogin")
    public Result<Map<String, Object>> wxLogin(@Valid @RequestBody WxLoginDTO wxLoginDTO) {
        return Result.success(userService.wxLogin(wxLoginDTO));
    }

    /**
     * 管理员入口 — 密码验证
     * 需要 JWT 认证
     */
    @PostMapping("/admin-switch")
    public Result<Map<String, Object>> switchToAdmin(@Valid @RequestBody AdminSwitchDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(userService.switchToAdmin(userId, dto.getPassword()));
    }

    /**
     * 获取用户信息
     * 需要 JWT 认证
     */
    @GetMapping("/profile")
    public Result<Map<String, Object>> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userService.getUserById(userId);

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("openid", user.getOpenid());
        data.put("nickname", user.getNickname());
        data.put("avatarUrl", user.getAvatarUrl());
        data.put("studentId", user.getStudentId());
        data.put("isCertified", user.getIsCertified());
        data.put("certifiedAt", user.getCertifiedAt());
        data.put("grade", user.getGrade());
        data.put("creditScore", user.getCreditScore());
        data.put("completedDeals", user.getCompletedDeals());
        data.put("cancelledDeals", user.getCancelledDeals());
        data.put("role", user.getRole());
        data.put("createTime", user.getCreateTime());
        data.put("favoriteCount", favoriteMapper.findByUserId(userId).size());
        return Result.success(data);
    }

    /**
     * 更新用户资料
     * 需要 JWT 认证
     */
    @PutMapping("/profile")
    public Result<User> updateProfile(@Valid @RequestBody UpdateProfileDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userService.updateProfile(userId, dto);
        return Result.success(user);
    }

    /**
     * 管理员独立登录
     * 使用预置管理员的密码登录，返回管理员账户的JWT token
     */
    @PostMapping("/admin/login")
    public Result<Map<String, Object>> adminLogin(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || password.trim().isEmpty()) {
            return Result.error("密码不能为空");
        }
        Map<String, Object> result = userService.adminLogin(password.trim());
        return Result.success(result);
    }

    /**
     * 查询管理员入口是否被锁定
     */
    @GetMapping("/admin/status")
    public Result<Map<String, Object>> getAdminStatus() {
        boolean locked = userService.isAdminLocked();
        Map<String, Object> data = new HashMap<>();
        data.put("locked", locked);
        return Result.success(data);
    }

    /**
     * 提交校园认证（创建待审核记录）
     * 需要 JWT 认证
     */
    @PostMapping("/certify")
    public Result<Void> certify(@Valid @RequestBody CertifyDTO certifyDTO, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        userService.certify(userId, certifyDTO.getStudentId(), certifyDTO.getEmail());
        return Result.success(null);
    }

    /**
     * 获取当前用户的认证状态
     * 需要 JWT 认证
     */
    @GetMapping("/certification/status")
    public Result<Certification> getCertificationStatus(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Certification cert = certificationService.getUserCertificationStatus(userId);
        return Result.success(cert);
    }

}