package com.example.QuizApp.controller;

import com.example.QuizApp.config.JwtUtil;
import com.example.QuizApp.dto.*;
import com.example.QuizApp.model.BlacklistedToken;
import com.example.QuizApp.model.PasswordResetToken;
import com.example.QuizApp.model.Role;
import com.example.QuizApp.model.User;
import com.example.QuizApp.repository.PasswordResetTokenRepository;
import com.example.QuizApp.repository.TokenBlacklistRepository;
import com.example.QuizApp.repository.UserRepository;
import com.example.QuizApp.service.EmailService;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired
    private EmailService emailService;

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final com.example.QuizApp.service.UserDetailsServiceImpl userDetailsService;

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;

    //singup functionality
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singletonList(Role.ROLE_USER))
                .build();
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully, Please login");
    }


    //login functionality
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (!userOptional.isPresent()) {
            // Try finding by email instead
            userOptional = userRepository.findByEmail(request.getUsername());
        }
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            System.out.println("Login request for: " + request.getUsername());
            System.out.println("User found: " + user.getUsername());
            System.out.println("Password match: " + passwordEncoder.matches(request.getPassword(), user.getPassword()));
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                // ✅ Load full UserDetails object
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
                String token = jwtUtil.generateToken(userDetails);
                UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
                return ResponseEntity.ok(new AuthResponse(token, userDTO));

            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }


    //pass reset functionality (POST /auth/request-reset?email=youruser@example.com)
    @PostMapping("/request-reset")
    public String requestPasswordReset(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "No user found with this email";
        }
        // Optional: delete old tokens
        passwordResetTokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .email(email)
                .token(token)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(email, token);

        return "Password reset link sent to your email";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody PasswordResetRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "Token has expired";
        }
//        System.out.println("Received reset token: " + request.getToken());

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken); // Remove token after use
        return "Password successfully reset. Please log in with your new password.";
    }


    //logout functionality
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid or missing Authorization header");
        }

        String token = authHeader.replace("Bearer ", "").trim();

        if (token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token is empty");
        }

        BlacklistedToken blacklistedToken = new BlacklistedToken();
        blacklistedToken.setToken(token);
        tokenBlacklistRepository.save(blacklistedToken);

        return ResponseEntity.ok("Logged out successfully");
    }


    @Data
    static class AuthRequest {
        private String username;
        private String password;
    }
}
