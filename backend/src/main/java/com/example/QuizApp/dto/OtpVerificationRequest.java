package com.example.QuizApp.dto;

import lombok.Data;

@Data
public class OtpVerificationRequest {
    private String email;
    private String otp;

    // Getters and setters or use Lombok @Data
}
