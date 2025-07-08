package com.example.QuizApp.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "otp_tokens")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OtpToken {
    @Id
    private String id;

    private String email;
    private String otp;
    private LocalDateTime expiryTime;
}
