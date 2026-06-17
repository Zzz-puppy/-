package com.example.xyzmarket.service;

import com.example.xyzmarket.entity.Notification;

import java.util.List;

public interface NotificationService {

    /**
     * 创建通知
     */
    void createNotification(Long userId, String type, String title, String content, Long relatedId);

    /**
     * 获取用户的通知列表
     */
    List<Notification> getMyNotifications(Long userId);

    /**
     * 获取未读通知数量
     */
    long getUnreadCount(Long userId);

    /**
     * 标记单条通知为已读
     */
    void markAsRead(Long id, Long userId);

    /**
     * 标记所有通知为已读
     */
    void markAllAsRead(Long userId);

}