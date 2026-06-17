package com.example.xyzmarket.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Notification {

    private Long id;

    private Long userId;

    private String type; // 'order', 'certification'

    private String title;

    private String content;

    private Long relatedId;

    private Boolean isRead;

    private LocalDateTime createTime;

}