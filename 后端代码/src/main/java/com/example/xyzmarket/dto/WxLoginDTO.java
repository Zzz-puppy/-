package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 一键登录 DTO（仅需微信 code）
 */
@Data
public class WxLoginDTO {

    @NotBlank(message = "code 不能为空")
    private String code;
}