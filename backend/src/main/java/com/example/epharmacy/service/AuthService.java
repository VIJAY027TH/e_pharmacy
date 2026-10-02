package com.example.epharmacy.service;

import com.example.epharmacy.dto.LoginRequest;
import com.example.epharmacy.dto.LoginResponse;
import com.example.epharmacy.dto.RegisterRequest;
import com.example.epharmacy.entity.Cart;
import com.example.epharmacy.entity.RoleName;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.exception.UnauthorizedException;
import com.example.epharmacy.repository.CartRepository;
import com.example.epharmacy.repository.UserRepository;
import com.example.epharmacy.security.CustomUserDetailsService;
import com.example.epharmacy.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository, CartRepository cartRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       CustomUserDetailsService userDetailsService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.notificationService = notificationService;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                request.getAddress(),
                RoleName.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        // Create empty Cart for user
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        // Send Welcome Notification
        notificationService.createNotification(
                savedUser,
                "Welcome to E-Pharmacy!",
                "Thank you for registering with E-Pharmacy. Explore medicines and manage your health seamlessly.",
                "WELCOME"
        );

        return savedUser;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getRole().name());
    }
}
