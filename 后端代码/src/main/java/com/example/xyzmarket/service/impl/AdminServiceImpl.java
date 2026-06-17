package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.common.ErrorCode;
import com.example.xyzmarket.entity.Certification;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.entity.Notification;
import com.example.xyzmarket.entity.Report;
import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.exception.BusinessException;
import com.example.xyzmarket.mapper.CertificationMapper;
import com.example.xyzmarket.mapper.ItemMapper;
import com.example.xyzmarket.mapper.NotificationMapper;
import com.example.xyzmarket.mapper.ReportMapper;
import com.example.xyzmarket.mapper.UserMapper;
import com.example.xyzmarket.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private CertificationMapper certificationMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ItemMapper itemMapper;

    @Autowired
    private ReportMapper reportMapper;

    @Autowired
    private NotificationMapper notificationMapper;

    @Override
    public List<Certification> getPendingCertifications() {
        return certificationMapper.findPendingList();
    }

    @Override
    @Transactional
    public void approveCertification(Long certId, Long reviewerId) {
        Certification cert = certificationMapper.findById(certId);
        if (cert == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "认证记录不存在");
        }
        if (!"pending".equals(cert.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "该认证申请已被处理");
        }

        // 更新认证记录状态
        certificationMapper.updateStatus(certId, "approved", null, reviewerId, LocalDateTime.now());

        // 更新用户表的认证状态
        userMapper.certify(cert.getUserId(), cert.getStudentId(), LocalDateTime.now());

        // 通知用户：认证通过
        try {
            Notification notif = new Notification();
            notif.setUserId(cert.getUserId());
            notif.setType("certification");
            notif.setTitle("校园认证已通过");
            notif.setContent("您的校园认证申请已通过审核，学号：" + cert.getStudentId());
            notif.setRelatedId(cert.getId());
            notif.setIsRead(false);
            notif.setCreateTime(LocalDateTime.now());
            notificationMapper.insert(notif);
        } catch (Exception ignored) {}
    }

    @Override
    @Transactional
    public void rejectCertification(Long certId, Long reviewerId, String reason) {
        Certification cert = certificationMapper.findById(certId);
        if (cert == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "认证记录不存在");
        }
        if (!"pending".equals(cert.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "该认证申请已被处理");
        }

        // 更新认证记录状态
        certificationMapper.updateStatus(certId, "rejected", reason, reviewerId, LocalDateTime.now());

        // 通知用户：认证被拒绝
        try {
            Notification notif = new Notification();
            notif.setUserId(cert.getUserId());
            notif.setType("certification");
            notif.setTitle("校园认证未通过");
            notif.setContent("您的校园认证申请已被拒绝，原因：" + reason);
            notif.setRelatedId(cert.getId());
            notif.setIsRead(false);
            notif.setCreateTime(LocalDateTime.now());
            notificationMapper.insert(notif);
        } catch (Exception ignored) {}
    }

    @Override
    public List<User> getAllUsers() {
        return userMapper.listAll();
    }

    @Override
    @Transactional
    public void banItem(Long itemId, Long adminId) {
        Item item = itemMapper.findById(itemId);
        if (item == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        }
        // 管理员直接封禁商品，不检查卖家身份
        itemMapper.updateStatus(itemId, 2, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void updateUserCreditScore(Long userId, Integer delta) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }

        Integer currentScore = user.getCreditScore();
        // 如果数据库中的信用分为null，则默认为60
        if (currentScore == null) {
            currentScore = 60;
        }

        // 如果当前信用分已经是0，且是扣分操作，则不允许再扣分
        if (currentScore <= 0 && delta < 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "用户信用分已为0，无法继续扣分");
        }

        // 如果当前信用分已经是100，且是加分操作，则不允许再加分
        if (currentScore >= 100 && delta > 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "用户信用分已为100，无法继续加分");
        }

        // 计算新的信用分（范围 0-100）
        int newScore = Math.max(0, Math.min(100, currentScore + delta));

        userMapper.updateCreditScore(userId, newScore,
                user.getCompletedDeals() == null ? 0 : user.getCompletedDeals(),
                user.getCancelledDeals() == null ? 0 : user.getCancelledDeals(),
                LocalDateTime.now());
    }

    @Override
    public List<Item> getAllItems() {
        return itemMapper.findAll();
    }

    @Override
    public List<Report> getAllReports() {
        return reportMapper.findAll();
    }

    @Override
    public List<Report> getPendingReports() {
        return reportMapper.findByStatus("pending");
    }

    @Override
    @Transactional
    public void approveReport(Long reportId, Long reviewerId) {
        Report report = reportMapper.findById(reportId);
        if (report == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "举报不存在");
        }
        if (!"pending".equals(report.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "该举报已处理");
        }
        reportMapper.updateStatus(reportId, "approved", reviewerId, LocalDateTime.now());
        itemMapper.updateStatus(report.getItemId(), 2, LocalDateTime.now());
    }

    @Override
    public void rejectReport(Long reportId, Long reviewerId, String reason) {
        Report report = reportMapper.findById(reportId);
        if (report == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "举报不存在");
        }
        if (!"pending".equals(report.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "该举报已处理");
        }
        reportMapper.reject(reportId, "rejected", reason, reviewerId, LocalDateTime.now());
    }
}