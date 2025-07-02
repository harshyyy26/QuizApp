package com.example.QuizApp.repository;

import com.example.QuizApp.model.BlacklistedToken;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TokenBlacklistRepository extends MongoRepository<BlacklistedToken, String> {
    boolean existsByToken(String token);
}
