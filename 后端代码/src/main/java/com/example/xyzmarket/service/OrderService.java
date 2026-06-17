package com.example.xyzmarket.service;

import com.example.xyzmarket.dto.OrderDTO;
import com.example.xyzmarket.entity.Order;

import java.util.List;

public interface OrderService {

    /**
     * 创建订单
     * @param orderDTO 订单信息（仅含 itemId）
     * @param buyerId 买家ID（从 token 获取）
     * @return 订单ID
     */
    Long createOrder(OrderDTO orderDTO, Long buyerId);

    /**
     * 查询我的订单（买家或卖家）
     * @param userId 用户ID（从 token 获取）
     * @return 订单列表
     */
    List<Order> getMyOrders(Long userId);

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 新状态
     * @param userId 操作用户ID（从 token 获取，用于权限校验）
     * @return 是否成功
     */
    boolean updateOrderStatus(Long orderId, Integer status, Long userId);

    /**
     * 卖家确认售出（订单完成）
     * @param orderId 订单ID
     * @param sellerId 卖家ID（从 token 获取）
     * @return 是否成功
     */
    boolean completeSale(Long orderId, Long sellerId);

    /**
     * 获取商品待确认订单列表
     * @param itemId 商品ID
     * @return 待确认订单列表
     */
    List<Order> getPendingOrdersByItemId(Long itemId);

    /**
     * 获取卖家视角的订单列表
     * @param sellerId 卖家ID
     * @return 订单列表
     */
    List<Order> getSellerOrders(Long sellerId);

}