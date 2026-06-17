package com.example.xyzmarket.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Wanted {

    private Long id;

    private Long userId;

    private String title;

    private String description;

    private Integer categoryId;

    private BigDecimal budget;

    private Integer status; // 0-active 1-fulfilled 2-cancelled

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    // 非数据库字段
    private String userName;

    private Boolean userIsCertified;

    private String categoryName;

}