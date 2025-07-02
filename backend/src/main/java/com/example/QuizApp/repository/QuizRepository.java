package com.example.QuizApp.repository;

import com.example.QuizApp.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findBySubject(String subject);
}
