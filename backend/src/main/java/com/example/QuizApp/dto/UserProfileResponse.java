package com.example.QuizApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String email;
    private List<String> roles;
}
