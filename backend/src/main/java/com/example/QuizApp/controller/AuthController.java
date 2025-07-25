package com.example.QuizApp.controller;

import com.example.QuizApp.config.JwtUtil;
import com.example.QuizApp.dto.*;
import com.example.QuizApp.model.*;
import com.example.QuizApp.repository.OtpTokenRepository;
import com.example.QuizApp.repository.PasswordResetTokenRepository;
import com.example.QuizApp.repository.TokenBlacklistRepository;
import com.example.QuizApp.repository.UserRepository;
import com.example.QuizApp.service.EmailService;
import com.example.QuizApp.service.UserDetailsServiceImpl;
import com.example.QuizApp.util.OtpUtil;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

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
    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;
    @Autowired
    private AuthenticationManager authManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserDetailsServiceImpl userDetailsService;


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

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No user found with given username or email");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Incorrect password");
        }

        // ✅ Load full UserDetails object
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(new AuthResponse(token, userDTO));
    }



    //pass reset functionality (POST /auth/request-reset?email=youruser@example.com)
    @PostMapping("/request-reset")
    public ResponseEntity<String> requestPasswordReset(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No user found with this email");
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

        return ResponseEntity.ok("Password reset link sent to your email");
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

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody EmailRequest request) {
        String email = request.getEmail();

        System.out.println("OTP request received for email: " + email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with this email.");
        }

        // ✅ Clear old OTPs
        otpTokenRepository.deleteByEmail(email);

        // ✅ Generate OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(expiry)
                .build();

        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(email, otp); // Your email service should send this

        return ResponseEntity.ok("OTP sent to your email.");
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();

        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmail(email);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No OTP found or expired.");
        }

        OtpToken token = tokenOpt.get();

        if (!token.getOtp().equals(otp)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP.");
        }

        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpTokenRepository.delete(token);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP has expired.");
        }

        // ✅ Load UserDetails and generate JWT token
        User user = userRepository.findByEmail(email).get();
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList())
        );

        String jwt = jwtUtil.generateToken(userDetails);
        otpTokenRepository.delete(token); // 🔐 Delete OTP after use

        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(new AuthResponse(jwt, userDTO));
    }





//
//
//    @Data
//    static class AuthRequest {
//        private String username;
//        private String password;
//    }
}
