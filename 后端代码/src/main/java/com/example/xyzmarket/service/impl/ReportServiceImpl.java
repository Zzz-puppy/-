package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.exception.BusinessException;
import com.example.xyzmarket.common.ErrorCode;
import com.example.xyzmarket.dto.ReportDTO;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.entity.Report;
import com.example.xyzmarket.mapper.ItemMapper;
import com.example.xyzmarket.mapper.ReportMapper;
import com.example.xyzmarket.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private ReportMapper reportMapper;

    @Autowired
    private ItemMapper itemMapper;

    @Override
    public void submitReport(ReportDTO reportDTO, Long reporterId) {
        Item item = itemMapper.findById(reportDTO.getItemId());
        if (item == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        }
        if (item.getSellerId().equals(reporterId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "不能举报自己的商品");
        }
        if (reportMapper.countByUserAndItem(reporterId, reportDTO.getItemId()) > 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "您已举报过该商品");
        }

        Report report = new Report();
        report.setReporterId(reporterId);
        report.setItemId(reportDTO.getItemId());
        report.setType(reportDTO.getType());
        report.setDescription(reportDTO.getDescription());
        report.setImageUrls(reportDTO.getImageUrls());
        report.setStatus("pending");
        report.setCreateTime(LocalDateTime.now());
        reportMapper.insert(report);
    }

    @Override
    public List<Report> getPendingReports() {
        return reportMapper.findByStatus("pending");
    }

    @Override
    public List<Report> getAllReports() {
        return reportMapper.findAll();
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

        // 下架被举报的商品
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