package com.example.QuizApp.controller;

import com.example.QuizApp.config.JwtUtil;
import com.example.QuizApp.dto.AdminQuizSubjectResponse;
import com.example.QuizApp.dto.AuthResponse;
import com.example.QuizApp.dto.UserDTO;
import com.example.QuizApp.model.Question;
import com.example.QuizApp.model.Quiz;
import com.example.QuizApp.model.Role;
import com.example.QuizApp.model.User;
import com.example.QuizApp.repository.QuizAttemptRepository;
import com.example.QuizApp.repository.QuizRepository;
import com.example.QuizApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;



    @Autowired
    private UserRepository userRepository;
    // Add a new quiz subject
    @PostMapping("/addQuiz")
    public Quiz addQuiz(@RequestBody Quiz quiz) {
        if (quiz.getQuestions() == null) {
            quiz.setQuestions(new ArrayList<>());
        }
        System.out.println("✅ Received Quiz: " + quiz.getSubject());
        return quizRepository.save(quiz);
    }


    // Add questions to existing quiz (only 1-1 que can be added)
    @PutMapping("/addQuestion/{quizId}")
    public Quiz addQuestion(@PathVariable String quizId, @RequestBody Question question) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isPresent()) {
            Quiz quiz = quizOpt.get();
            quiz.getQuestions().add(question);
            return quizRepository.save(quiz);
        } else {
            throw new RuntimeException("Quiz not found");
        }
    }

    //updating question of a particular quiz
    @PutMapping("/updateQuestion/{quizId}/{questionId}")
    public Quiz updateQuestion(
            @PathVariable String quizId,
            @PathVariable String questionId,
            @RequestBody Question updatedQuestion
    ) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        System.out.println("Updating Question ID: " + questionId);
        System.out.println("New data: " + updatedQuestion);


        List<Question> questions = quiz.getQuestions();
        boolean found = false;

        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            if (q.getId().equals(questionId)) {
                // Update fields
                q.setQuestionText(updatedQuestion.getQuestionText());
                q.setOptionA(updatedQuestion.getOptionA());
                q.setOptionB(updatedQuestion.getOptionB());
                q.setOptionC(updatedQuestion.getOptionC());
                q.setOptionD(updatedQuestion.getOptionD());
                q.setCorrectAnswer(updatedQuestion.getCorrectAnswer());
                found = true;
                break;
            }
        }
        if (!found) {
            throw new RuntimeException("Question not found in the quiz");
        }
        return quizRepository.save(quiz);
    }

    @DeleteMapping("/deleteQuestion/{quizId}/{questionId}")
    public Quiz deleteQuestion(
            @PathVariable String quizId,
            @PathVariable String questionId
    ) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<Question> questions = quiz.getQuestions();
        boolean removed = questions.removeIf(q -> q.getId().equals(questionId));

        if (!removed) {
            throw new RuntimeException("Question not found in the quiz");
        }

        quiz.setQuestions(questions); // Update the questions list
        return quizRepository.save(quiz);
    }


    // Delete quiz
    @DeleteMapping("/deleteQuiz/{quizId}")
    public String deleteQuiz(@PathVariable String quizId) {
        quizRepository.deleteById(quizId);
        return "Quiz deleted";
    }

    // Get all quizzes (for admin)
    @GetMapping("/quizzes")
    public List<AdminQuizSubjectResponse> getQuizSubjectsOnly() {
        return quizRepository.findAll().stream()
                .map(quiz -> new AdminQuizSubjectResponse(quiz.getId(), quiz.getSubject()))
                .collect(Collectors.toList());
    }

    // ✅ Return full quiz with questions
    @GetMapping("/quiz/{quizId}")
    public Quiz getQuizById(@PathVariable String quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (userRepository.existsById(id)) {
            quizAttemptRepository.deleteByUserId(id);
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }

}
