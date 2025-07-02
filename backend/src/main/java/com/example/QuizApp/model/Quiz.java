package com.example.QuizApp.model;

import com.example.QuizApp.model.Question;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    private String id;
    private String subject;
    private List<Question> questions;
}
