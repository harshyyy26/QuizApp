package com.example.QuizApp.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;  // Can be either username or email
    private String password;
}
