package com.example.QuizApp.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizAttemptResponse {
    private String quizId;
    private int score;
    private int totalQuestions;
    private List<String> answers;
    private LocalDateTime attemptedAt;
}
