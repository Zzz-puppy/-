package com.example.xyzmarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 举报请求 DTO
 */
@Data
public class ReportDTO {

    @NotNull(message = "商品ID不能为空")
    private Long itemId;

    @NotBlank(message = "举报类型不能为空")
    private String type;

    private String description;

    private String imageUrls;

}