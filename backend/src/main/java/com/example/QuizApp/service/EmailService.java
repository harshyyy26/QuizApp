package com.example.QuizApp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Async
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

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Your OTP for QuizApp Login";
        String body = "Your OTP is: " + otp + "\nThis OTP will expire in 5 minutes.";

        sendEmail(toEmail, subject, body); // assuming you already have this method
    }





}
