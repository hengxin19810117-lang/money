package com.finance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChannelRequest {

    @NotBlank(message = "渠道名称不能为空")
    private String name;

    private String icon;

    private String color;
}
