package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 商品 DTO
 * 注意：sellerId 从 JWT token 获取，不由前端传入
 */
@Data
public class ItemDTO {

    @NotBlank(message = "商品标题不能为空")
    private String title;

    private String description;

    @NotNull(message = "价格不能为空")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message = "商品分类不能为空")
    private Integer categoryId;

    // 交易方式
    private Boolean pickup;    // 线下自提
    private Boolean tradeable; // 可置换

}