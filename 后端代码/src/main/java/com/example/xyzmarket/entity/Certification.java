package com.example.xyzmarket.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 认证记录实体类
 */
@Data
public class Certification {

    private Long id;

    private Long userId;

    private String studentId;

    private String email;

    private String status; // pending / approved / rejected

    private String rejectReason;

    private Long reviewerId;

    private LocalDateTime createTime;

    private LocalDateTime reviewTime;

}