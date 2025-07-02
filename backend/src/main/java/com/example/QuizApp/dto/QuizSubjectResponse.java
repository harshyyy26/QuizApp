package com.example.QuizApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuizSubjectResponse {
    private String id;
    private String subject;
    private int questionCount;
}
