package com.example.xyzmarket.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体类（微信小程序版）
 */
@Data
public class User {

    private Long id;

    private String openid;

    private String nickname;

    private String avatarUrl;

    private String studentId;

    private Boolean isCertified;

    private LocalDateTime certifiedAt;

    private String grade;

    private Integer creditScore;

    private Integer completedDeals = 0;

    private Integer cancelledDeals = 0;

    private String role = "user";

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

}