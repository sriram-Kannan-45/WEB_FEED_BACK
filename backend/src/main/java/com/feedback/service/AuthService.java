package com.feedback.service;

import com.feedback.dto.AuthResponse;
import com.feedback.dto.CreateTrainerRequest;
import com.feedback.dto.LoginRequest;
import com.feedback.dto.RegisterRequest;
import com.feedback.entity.User;
import com.feedback.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostConstruct
    public void initDefaultAdmin() {
        if (!userRepository.existsByEmail("shri@123")) {
            User admin = new User();
            admin.setEmail("shri@123");
            admin.setPassword(passwordEncoder.encode("shri@123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Default admin created: shri@123");
        }
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return new AuthResponse(user.getId(), user.getEmail(), user.getRole(), "Login successful");
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PARTICIPANT);

        User savedUser = userRepository.save(user);
        return new AuthResponse(savedUser.getId(), savedUser.getEmail(), savedUser.getRole(), "Registration successful");
    }

    public AuthResponse createTrainer(CreateTrainerRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admin can create trainers");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User trainer = new User();
        trainer.setEmail(request.getEmail());
        trainer.setPassword(passwordEncoder.encode(request.getPassword()));
        trainer.setRole(User.Role.TRAINER);

        User savedTrainer = userRepository.save(trainer);
        return new AuthResponse(savedTrainer.getId(), savedTrainer.getEmail(), savedTrainer.getRole(), "Trainer created successfully");
    }
}