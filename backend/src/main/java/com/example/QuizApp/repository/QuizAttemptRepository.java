package com.example.QuizApp.repository;

import com.example.QuizApp.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUserId(String userId);

    List<QuizAttempt> findByQuizId(String quizId);

    void deleteByUserId(String userId);

}
