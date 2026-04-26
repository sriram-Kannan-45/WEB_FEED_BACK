package com.feedback.controller;

import com.feedback.dto.AuthResponse;
import com.feedback.dto.CreateTrainerRequest;
import com.feedback.dto.LoginRequest;
import com.feedback.dto.RegisterRequest;
import com.feedback.dto.TrainerListResponse;
import com.feedback.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/create-trainer")
    public ResponseEntity<AuthResponse> createTrainer(
            @Valid @RequestBody CreateTrainerRequest request,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        
        if (adminEmail == null || adminEmail.isEmpty()) {
            return ResponseEntity.status(401).body(
                new AuthResponse(null, null, null, null, "Admin authentication required"));
        }
        
        AuthResponse response = authService.createTrainer(request, adminEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trainers")
    public ResponseEntity<TrainerListResponse> getTrainers() {
        TrainerListResponse response = authService.getTrainers();
        return ResponseEntity.ok(response);
    }
}