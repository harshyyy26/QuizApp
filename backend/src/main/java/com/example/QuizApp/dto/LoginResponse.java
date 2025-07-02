package com.example.QuizApp.dto;

import com.example.QuizApp.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private List<Role> roles;
}
