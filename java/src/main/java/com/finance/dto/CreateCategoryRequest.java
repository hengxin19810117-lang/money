package com.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryRequest {

    @NotBlank(message = "分类名称不能为空")
    private String name;

    @NotBlank(message = "分类类型不能为空")
    @Pattern(regexp = "^(expense|income)$", message = "类型必须是 expense 或 income")
    private String type;

    private String icon;

    private String color;
}
