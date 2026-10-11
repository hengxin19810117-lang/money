package com.finance.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 50, message = "昵称最多50位")
    private String nickname;

    private String avatar;

    @Size(max = 100, message = "邮箱最多100位")
    private String email;

    @Size(max = 20, message = "手机号最多20位")
    private String phone;
}
