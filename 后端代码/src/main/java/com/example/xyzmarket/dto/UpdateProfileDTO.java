package com.example.xyzmarket.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新用户资料 DTO
 */
@Data
public class UpdateProfileDTO {

    @Size(max = 50, message = "昵称最多50个字符")
    private String nickname;

    @Size(max = 255, message = "头像URL过长")
    private String avatarUrl;

    @Size(max = 50, message = "年级专业最多50个字符")
    private String grade;
}