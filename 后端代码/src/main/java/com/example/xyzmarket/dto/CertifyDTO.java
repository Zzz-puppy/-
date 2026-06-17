package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CertifyDTO {

    @NotBlank(message = "学号不能为空")
    private String studentId;

    private String email;
}