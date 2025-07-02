package com.example.QuizApp.model;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    private String id = UUID.randomUUID().toString(); // ✅ auto-generated unique ID
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer; // store correct answer: A/B/C/D
}
