package com.example.xyzmarket.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品实体类
 */
@Data
public class Item {

    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private String imageUrl;

    private Long sellerId;

    private Integer categoryId;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    // 非数据库字段，JOIN查询填充
    private String sellerName;
    private Integer sellerCreditScore;
    private String sellerStudentId;
    private Boolean sellerIsCertified;

    // 交易方式
    private Boolean pickup;    // 线下自提
    private Boolean tradeable; // 可置换

}