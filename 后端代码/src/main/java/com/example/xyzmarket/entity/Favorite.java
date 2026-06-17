package com.example.xyzmarket.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 收藏实体类
 */
@Data
public class Favorite {

    private Long id;

    private Long userId;

    private Long itemId;

    private LocalDateTime createTime;

}