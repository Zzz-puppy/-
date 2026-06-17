package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Notification;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface NotificationMapper {

    @Insert("INSERT INTO notification (user_id, type, title, content, related_id, is_read, create_time) " +
            "VALUES (#{userId}, #{type}, #{title}, #{content}, #{relatedId}, #{isRead}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insert(Notification notification);

    @Select("SELECT * FROM notification WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<Notification> findByUserId(@Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM notification WHERE user_id = #{userId} AND is_read = FALSE")
    long countUnread(@Param("userId") Long userId);

    @Update("UPDATE notification SET is_read = TRUE WHERE id = #{id} AND user_id = #{userId}")
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    @Update("UPDATE notification SET is_read = TRUE WHERE user_id = #{userId}")
    int markAllAsRead(@Param("userId") Long userId);

}