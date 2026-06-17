package com.example.xyzmarket.controller;

import com.example.xyzmarket.common.Result;
import com.example.xyzmarket.dto.ReportDTO;
import com.example.xyzmarket.entity.Report;
import com.example.xyzmarket.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * 提交举报
     */
    @PostMapping
    public Result<Void> submitReport(@Valid @RequestBody ReportDTO reportDTO, HttpServletRequest request) {
        Long reporterId = (Long) request.getAttribute("userId");
        reportService.submitReport(reportDTO, reporterId);
        return Result.success();
    }

}