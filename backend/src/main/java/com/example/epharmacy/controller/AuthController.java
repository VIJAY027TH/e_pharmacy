package com.example.epharmacy.controller;

import com.example.epharmacy.dto.LoginRequest;
import com.example.epharmacy.dto.LoginResponse;
import com.example.epharmacy.dto.RegisterRequest;
import com.example.epharmacy.dto.UserResponse;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return new ResponseEntity<>(new UserResponse(user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
