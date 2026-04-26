package com.feedback.service;

import com.feedback.dto.AuthResponse;
import com.feedback.dto.CreateTrainerRequest;
import com.feedback.dto.LoginRequest;
import com.feedback.dto.RegisterRequest;
import com.feedback.dto.TrainerInfo;
import com.feedback.dto.TrainerListResponse;
import com.feedback.entity.User;
import com.feedback.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void initDefaultAdmin() {
        if (!userRepository.findByEmail("shri@123").isPresent()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("shri@123");
            admin.setPassword(passwordEncoder.encode("shri@123"));
            admin.setPhone("0000000000");
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

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), "Login successful");
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setTrainingId(request.getTrainingId());
        user.setRole(User.Role.PARTICIPANT);

        User savedUser = userRepository.save(user);
        return new AuthResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), "Registration successful");
    }

    public AuthResponse createTrainer(CreateTrainerRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admin can create trainers");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String temporaryPassword = generateTemporaryPassword();

        User trainer = new User();
        trainer.setName(request.getName());
        trainer.setEmail(request.getEmail());
        trainer.setPassword(passwordEncoder.encode(temporaryPassword));
        trainer.setPhone("0000000000");
        trainer.setRole(User.Role.TRAINER);

        User savedTrainer = userRepository.save(trainer);
        return new AuthResponse(savedTrainer.getId(), savedTrainer.getName(), savedTrainer.getEmail(), savedTrainer.getRole(), "Trainer created successfully. Temporary password: " + temporaryPassword);
    }

    private String generateTemporaryPassword() {
        byte[] randomBytes = new byte[12];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes).substring(0, 12);
    }

    public TrainerListResponse getTrainers() {
        List<User> trainers = userRepository.findByRole(User.Role.TRAINER);
        List<TrainerInfo> trainerResponses = trainers.stream()
                .map(t -> new TrainerInfo(t.getId(), t.getName(), t.getEmail()))
                .collect(Collectors.toList());
        return new TrainerListResponse(trainerResponses);
    }
}