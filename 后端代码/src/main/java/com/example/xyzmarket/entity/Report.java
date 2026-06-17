package com.example.xyzmarket.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 举报实体类
 */
@Data
public class Report {

    private Long id;

    private Long reporterId;

    private Long itemId;

    private String type;

    private String description;

    private String imageUrls;

    private String status;

    private String rejectReason;

    private Long reviewerId;

    private LocalDateTime createTime;

    private LocalDateTime reviewTime;

}