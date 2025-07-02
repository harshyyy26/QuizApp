package com.example.QuizApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LeaderboardEntry {
    private String username;
    private int score;
    private int totalQuestions;
    private LocalDateTime completedAt; // or Date
}
