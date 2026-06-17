package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.common.ErrorCode;
import com.example.xyzmarket.dto.OrderDTO;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.entity.Notification;
import com.example.xyzmarket.entity.Order;
import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.exception.BusinessException;
import com.example.xyzmarket.mapper.ItemMapper;
import com.example.xyzmarket.mapper.NotificationMapper;
import com.example.xyzmarket.mapper.OrderMapper;
import com.example.xyzmarket.mapper.UserMapper;
import com.example.xyzmarket.service.ItemService;
import com.example.xyzmarket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private ItemService itemService;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private ItemMapper itemMapper;

    @Autowired
    private NotificationMapper notificationMapper;

    @Override
    public Long createOrder(OrderDTO orderDTO, Long buyerId) {
        Item item = itemService.getItemById(orderDTO.getItemId());
        if (item == null) throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        if (item.getStatus() != 0) throw new BusinessException(ErrorCode.FORBIDDEN, "商品已售出或下架");
        if (item.getSellerId().equals(buyerId)) throw new BusinessException(ErrorCode.FORBIDDEN, "不能购买自己的商品");

        Order existingOrder = orderMapper.findByBuyerIdAndItemIdAndStatus(buyerId, orderDTO.getItemId(), 0);
        if (existingOrder != null) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "您已有该商品的待确认订单，请勿重复下单");
        }

        Order order = new Order();
        order.setItemId(orderDTO.getItemId());
        order.setBuyerId(buyerId);
        order.setSellerId(item.getSellerId());
        order.setStatus(0);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        orderMapper.insert(order);

        try {
            Notification notif = new Notification();
            notif.setUserId(item.getSellerId());
            notif.setType("order");
            notif.setTitle("新订单通知");
            notif.setContent("您的商品「" + item.getTitle() + "」已被下单，请及时处理");
            notif.setRelatedId(order.getId());
            notif.setIsRead(false);
            notif.setCreateTime(LocalDateTime.now());
            notificationMapper.insert(notif);
        } catch (Exception ignored) {}

        return order.getId();
    }

    @Override
    public List<Order> getMyOrders(Long userId) {
        return orderMapper.findByBuyerId(userId);
    }

    @Override
    @Transactional
    public boolean updateOrderStatus(Long orderId, Integer status, Long userId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) throw new BusinessException(ErrorCode.NOT_FOUND, "订单不存在");
        if (!userId.equals(order.getBuyerId()) && !userId.equals(order.getSellerId()))
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作此订单");

        if (status == 1) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "订单完成需由卖家操作");
        }

        orderMapper.updateStatus(orderId, status, LocalDateTime.now());

        if (status == 2) {
            addCreditScore(userId, -10);
            try {
                Long notifyUserId = userId.equals(order.getBuyerId()) ? order.getSellerId() : order.getBuyerId();
                Item item = itemMapper.findById(order.getItemId());
                String itemTitle = (item != null) ? item.getTitle() : ("商品#" + order.getItemId());
                Notification notif = new Notification();
                notif.setUserId(notifyUserId);
                notif.setType("order");
                notif.setTitle("订单已取消");
                notif.setContent("订单「" + itemTitle + "」已被取消");
                notif.setRelatedId(order.getId());
                notif.setIsRead(false);
                notif.setCreateTime(LocalDateTime.now());
                notificationMapper.insert(notif);
            } catch (Exception ignored) {}
        }

        return true;
    }

    @Override
    @Transactional
    public boolean completeSale(Long orderId, Long sellerId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) throw new BusinessException(ErrorCode.NOT_FOUND, "订单不存在");
        if (!sellerId.equals(order.getSellerId()))
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作此订单");
        if (order.getStatus() != 0)
            throw new BusinessException(ErrorCode.FORBIDDEN, "订单状态异常，已完成或已取消");

        orderMapper.updateStatus(orderId, 1, LocalDateTime.now());

        addCreditScore(order.getBuyerId(), 5);
        addCreditScore(order.getSellerId(), 5);

        Item item = itemService.getItemById(order.getItemId());
        if (item != null) {
            itemMapper.updateStatus(order.getItemId(), 1, LocalDateTime.now());
        }

        try {
            Notification notif = new Notification();
            notif.setUserId(order.getBuyerId());
            notif.setType("order");
            notif.setTitle("交易完成");
            notif.setContent("卖家已确认售出「" + item.getTitle() + "」，交易完成");
            notif.setRelatedId(order.getId());
            notif.setIsRead(false);
            notif.setCreateTime(LocalDateTime.now());
            notificationMapper.insert(notif);
        } catch (Exception ignored) {}

        return true;
    }

    @Override
    public List<Order> getPendingOrdersByItemId(Long itemId) {
        return orderMapper.findByItemIdAndStatus(itemId, 0);
    }

    @Override
    public List<Order> getSellerOrders(Long sellerId) {
        return orderMapper.findBySellerId(sellerId);
    }

    private void addCreditScore(Long userId, int delta) {
        User user = userMapper.findById(userId);
        if (user == null) return;

        Integer currentScore = user.getCreditScore();
        if (currentScore == null) currentScore = 60;

        Integer completed = user.getCompletedDeals();
        Integer cancelled = user.getCancelledDeals();
        if (completed == null) completed = 0;
        if (cancelled == null) cancelled = 0;

        if (delta > 0) {
            completed += 1;
        } else if (delta < 0) {
            cancelled += 1;
        }

        int newScore = Math.max(0, Math.min(100, currentScore + delta));
        userMapper.updateCreditScore(userId, newScore, completed, cancelled, LocalDateTime.now());
    }

}