package com.example.QuizApp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "quizAttempts")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizAttempt {
    @Id
    private String id;
    private String userId;
    private String quizId;
    private List<String> answers;
    private int score;
    private int totalQuestions;
    private LocalDateTime attemptedAt;
}
