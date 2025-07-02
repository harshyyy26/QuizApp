package com.example.QuizApp.controller;

import com.example.QuizApp.config.JwtUtil;
import com.example.QuizApp.dto.*;
import com.example.QuizApp.model.Question;
import com.example.QuizApp.model.Quiz;
import com.example.QuizApp.model.QuizAttempt;
import com.example.QuizApp.model.User;
import com.example.QuizApp.repository.QuizAttemptRepository;
import com.example.QuizApp.repository.QuizRepository;
import com.example.QuizApp.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    private final QuizRepository quizRepository;

    @GetMapping("/profile")
    public UserProfileResponse getProfile(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toList())
        );
    }

    // Get quizzes by subject names
    @GetMapping("/quizSubjects")
    public List<QuizSubjectResponse> getQuizSubjectsOnly() {
        return quizRepository.findAll().stream()
                .map(quiz -> new QuizSubjectResponse(
                        quiz.getId(),
                        quiz.getSubject(),
                        quiz.getQuestions() != null ? quiz.getQuestions().size() : 0
                ))
                .collect(Collectors.toList());
    }

    //get ques for a particular quiz
    @GetMapping("/quiz/{quizId}")
    public List<Question> getQuestionsForQuiz(@PathVariable String quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"))
                .getQuestions()
                .stream()
                .map(q -> Question.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .build())
                .toList();
    }



    // Attempt a quiz and calculate score
    @PostMapping("/solve/{quizId}")
    public QuizResultResponse attemptQuiz(
            @PathVariable String quizId,
            @RequestBody List<String> answers,
            HttpServletRequest request) {

        // 1. Extract user info from JWT
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find the quiz
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<Question> questions = quiz.getQuestions();
        int score = 0;

        // 3. Score calculation
        for (int i = 0; i < questions.size(); i++) {
            if (i < answers.size() && answers.get(i) != null) {
                if (questions.get(i).getCorrectAnswer().equalsIgnoreCase(answers.get(i))) {
                    score++;
                }
            }
        }

        // 4. Save attempt history
        QuizAttempt attempt = QuizAttempt.builder()
                .userId(user.getId())
                .quizId(quizId)
                .answers(answers)
                .score(score)
                .totalQuestions(questions.size())
                .attemptedAt(LocalDateTime.now())
                .build();

        quizAttemptRepository.save(attempt);

        // 5. Return response
        return new QuizResultResponse(questions.size(), score, score);
    }

    @GetMapping("/attempts")
    public List<QuizAttemptResponse> getUserQuizAttempts(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(user.getId());

        return attempts.stream()
                .map(attempt -> new QuizAttemptResponse(
                        attempt.getQuizId(),
                        attempt.getScore(),
                        attempt.getTotalQuestions(),
                        attempt.getAnswers(),
                        attempt.getAttemptedAt()
                ))
                .toList();
    }

    @GetMapping("/leaderboard/{quizId}")
    public List<LeaderboardEntry> getBestLeaderboardForQuiz(@PathVariable String quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);

        // Map to store highest score per user
        Map<String, QuizAttempt> bestAttemptsMap = new HashMap<>();

        for (QuizAttempt attempt : attempts) {
            String userId = attempt.getUserId();
            if (!bestAttemptsMap.containsKey(userId) ||
                    attempt.getScore() > bestAttemptsMap.get(userId).getScore()) {
                bestAttemptsMap.put(userId, attempt);
            }
        }

        // Convert map values to sorted leaderboard entries
        return bestAttemptsMap.values().stream()
                .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))  // descending
                .map(attempt -> {
                    User user = userRepository.findById(attempt.getUserId())
                            .orElse(new User());
                    return new LeaderboardEntry(
                            user.getUsername() != null ? user.getUsername() : "Unknown",
                            attempt.getScore(),
                            attempt.getTotalQuestions(),
                            attempt.getAttemptedAt()
                    );
                })
                .toList();
    }
}
