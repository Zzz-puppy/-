package com.example.xyzmarket.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 订单实体类
 */
@Data
public class Order {

    private Long id;

    private Long itemId;

    private Long buyerId;

    private Long sellerId;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

}