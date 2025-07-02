package com.example.QuizApp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject("Password Reset Request - Quiz App");
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            String content = "<p>Hello,</p>"
                    + "<p>Click this below link for resetting the password of your Quiz App:</p>"
                    + "<p><a href=\"" + resetLink + "\">Reset Password</a></p>"
                    + "<p>This link will expire in 15 minutes.</p>"
                    + "<br><p>Regards,<br><b>Quiz App Team</b></p>";

            helper.setText(content, true);
            helper.setFrom("harshlgiri321@gmail.com", "Quiz App");

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
