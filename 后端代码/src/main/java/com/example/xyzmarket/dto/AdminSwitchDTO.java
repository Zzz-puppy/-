package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 管理员切换 DTO
 */
@Data
public class AdminSwitchDTO {

    @NotBlank(message = "管理员密码不能为空")
    private String password;
}