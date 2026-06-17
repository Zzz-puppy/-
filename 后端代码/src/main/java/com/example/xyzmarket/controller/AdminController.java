package com.example.xyzmarket.controller;

import com.example.xyzmarket.common.Result;
import com.example.xyzmarket.entity.Certification;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.entity.Report;
import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * 获取待审核的认证申请列表
     */
    @GetMapping("/certifications/pending")
    public Result<List<Certification>> getPendingCertifications() {
        List<Certification> list = adminService.getPendingCertifications();
        return Result.success(list);
    }

    /**
     * 批准认证申请
     */
    @PutMapping("/certifications/{id}/approve")
    public Result<Void> approveCertification(@PathVariable("id") Long id, HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("userId");
        adminService.approveCertification(id, adminId);
        return Result.success();
    }

    /**
     * 拒绝认证申请（带拒绝理由）
     */
    @PutMapping("/certifications/{id}/reject")
    public Result<Void> rejectCertification(@PathVariable("id") Long id,
                                             @RequestBody Map<String, String> body,
                                             HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("userId");
        String reason = body.getOrDefault("reason", "认证信息不符合要求");
        adminService.rejectCertification(id, adminId, reason);
        return Result.success();
    }

    /**
     * 获取所有用户列表
     */
    @GetMapping("/users")
    public Result<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return Result.success(users);
    }

    /**
     * 调整用户信用分
     */
    @PutMapping("/users/{id}/credit")
    public Result<Void> updateCreditScore(@PathVariable("id") Long userId,
                                           @RequestBody Map<String, Integer> body) {
        Integer delta = body.get("delta");
        if (delta == null) {
            delta = 0;
        }
        adminService.updateUserCreditScore(userId, delta);
        return Result.success();
    }

    /**
     * 封禁商品
     */
    @PutMapping("/items/{id}/ban")
    public Result<Void> banItem(@PathVariable("id") Long itemId, HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("userId");
        adminService.banItem(itemId, adminId);
        return Result.success();
    }

    /**
     * 获取所有商品（管理员用，含所有状态）
     */
    @GetMapping("/items")
    public Result<List<Item>> getAllItems() {
        List<Item> items = adminService.getAllItems();
        return Result.success(items);
    }

    // ===== 举报管理 =====

    /**
     * 获取所有举报
     */
    @GetMapping("/reports")
    public Result<List<Report>> getAllReports() {
        return Result.success(adminService.getAllReports());
    }

    /**
     * 获取待处理举报
     */
    @GetMapping("/reports/pending")
    public Result<List<Report>> getPendingReports() {
        return Result.success(adminService.getPendingReports());
    }

    /**
     * 批准举报（下架商品）
     */
    @PutMapping("/reports/{id}/approve")
    public Result<Void> approveReport(@PathVariable("id") Long id, HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("userId");
        adminService.approveReport(id, adminId);
        return Result.success();
    }

    /**
     * 驳回举报
     */
    @PutMapping("/reports/{id}/reject")
    public Result<Void> rejectReport(@PathVariable("id") Long id,
                                     @RequestBody Map<String, String> body,
                                     HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("userId");
        String reason = body.getOrDefault("reason", "经审核不属于违规内容");
        adminService.rejectReport(id, adminId, reason);
        return Result.success();
    }
}