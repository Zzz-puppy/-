package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 订单 DTO
 * 注意：buyerId 从 JWT token 获取，不由前端传入
 */
@Data
public class OrderDTO {

    @NotNull(message = "商品ID不能为空")
    private Long itemId;
}