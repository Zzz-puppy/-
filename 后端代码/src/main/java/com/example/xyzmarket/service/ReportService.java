package com.example.xyzmarket.service;

import com.example.xyzmarket.dto.ReportDTO;
import com.example.xyzmarket.entity.Report;

import java.util.List;

/**
 * 举报服务接口
 */
public interface ReportService {

    /**
     * 提交举报
     */
    void submitReport(ReportDTO reportDTO, Long reporterId);

    /**
     * 查询待处理举报
     */
    List<Report> getPendingReports();

    /**
     * 查询全部举报
     */
    List<Report> getAllReports();

    /**
     * 审核通过举报（下架商品）
     */
    void approveReport(Long reportId, Long reviewerId);

    /**
     * 驳回举报
     */
    void rejectReport(Long reportId, Long reviewerId, String reason);
}