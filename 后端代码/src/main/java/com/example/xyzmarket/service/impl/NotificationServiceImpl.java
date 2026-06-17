package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.entity.Notification;
import com.example.xyzmarket.mapper.NotificationMapper;
import com.example.xyzmarket.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationMapper notificationMapper;

    @Override
    public void createNotification(Long userId, String type, String title, String content, Long relatedId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedId(relatedId);
        notification.setIsRead(false);
        notification.setCreateTime(LocalDateTime.now());
        notificationMapper.insert(notification);
    }

    @Override
    public List<Notification> getMyNotifications(Long userId) {
        return notificationMapper.findByUserId(userId);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationMapper.countUnread(userId);
    }

    @Override
    public void markAsRead(Long id, Long userId) {
        notificationMapper.markAsRead(id, userId);
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationMapper.markAllAsRead(userId);
    }

}