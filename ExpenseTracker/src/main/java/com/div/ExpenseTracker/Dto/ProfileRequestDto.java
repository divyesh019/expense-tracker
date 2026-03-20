package com.div.ExpenseTracker.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileRequestDto {

    private String fullName;
    private String email;
    private String password;
    private String profileImageUrl;

}
