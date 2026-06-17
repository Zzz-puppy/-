package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WantedDTO {

    @NotBlank(message = "标题不能为空")
    private String title;

    private String description;

    private Integer categoryId;

    private BigDecimal budget;

}