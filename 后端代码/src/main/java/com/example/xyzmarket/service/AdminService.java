package com.example.xyzmarket.service;

import com.example.xyzmarket.entity.Certification;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.entity.Report;
import com.example.xyzmarket.entity.User;

import java.util.List;

public interface AdminService {

    /**
     * 获取待审核的认证列表
     */
    List<Certification> getPendingCertifications();

    /**
     * 批准认证申请
     */
    void approveCertification(Long certId, Long reviewerId);

    /**
     * 拒绝认证申请
     */
    void rejectCertification(Long certId, Long reviewerId, String reason);

    /**
     * 获取所有用户
     */
    List<User> getAllUsers();

    /**
     * 封禁商品（管理员操作，不检查卖家权限）
     */
    void banItem(Long itemId, Long adminId);

    /**
     * 调整用户信用分
     */
    void updateUserCreditScore(Long userId, Integer delta);

    /**
     * 获取所有商品（管理员用，含所有状态）
     */
    List<Item> getAllItems();

    /**
     * 获取所有举报
     */
    List<Report> getAllReports();

    /**
     * 获取待处理举报
     */
    List<Report> getPendingReports();

    /**
     * 批准举报（下架商品）
     */
    void approveReport(Long reportId, Long reviewerId);

    /**
     * 驳回举报
     */
    void rejectReport(Long reportId, Long reviewerId, String reason);
}