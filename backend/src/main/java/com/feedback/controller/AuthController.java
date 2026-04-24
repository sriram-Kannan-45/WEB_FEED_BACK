package com.feedback.controller;

import com.feedback.dto.*;
import com.feedback.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/createTrainer")
    public ResponseEntity<AuthResponse> createTrainer(
            @Valid @RequestBody CreateTrainerRequest request,
            @RequestHeader("X-Admin-Email") String adminEmail) {
        AuthResponse response = authService.createTrainer(request, adminEmail);
        return ResponseEntity.ok(response);
    }
}