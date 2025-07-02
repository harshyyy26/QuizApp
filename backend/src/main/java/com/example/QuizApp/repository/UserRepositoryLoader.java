package com.example.QuizApp.repository;

import com.example.QuizApp.model.Role;
import com.example.QuizApp.model.User;
import com.example.QuizApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class UserRepositoryLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Insert admin only if not already present
        if (!userRepository.existsByUsername("harshal")) {
            User admin = User.builder()
                    .username("harshal")
                    .email("harshlgiri321@gmail.com")
                    .password(passwordEncoder.encode("harshal"))
                    .roles(List.of(Role.ROLE_ADMIN))  // ✅ Fixed line
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Admin user created");
        }
    }
}
