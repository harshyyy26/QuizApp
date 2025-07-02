package com.example.QuizApp.dto;

import com.example.QuizApp.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor //latest added
public class AuthResponse {
    private String token;
    private UserDTO user;
}
