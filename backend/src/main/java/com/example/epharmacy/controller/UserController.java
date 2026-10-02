package com.example.epharmacy.controller;

import com.example.epharmacy.dto.RegisterRequest;
import com.example.epharmacy.dto.UserResponse;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.Prescription;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.OrderService;
import com.example.epharmacy.service.PrescriptionService;
import com.example.epharmacy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final OrderService orderService;
    private final PrescriptionService prescriptionService;

    public UserController(UserService userService, OrderService orderService, PrescriptionService prescriptionService) {
        this.userService = userService;
        this.orderService = orderService;
        this.prescriptionService = prescriptionService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(new UserResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(Authentication authentication, @RequestBody RegisterRequest request) {
        User updated = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(new UserResponse(updated));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        List<Order> orders = orderService.getUserOrders(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> getUserPrescriptions(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        List<Prescription> prescriptions = prescriptionService.getUserPrescriptions(user.getId());
        return ResponseEntity.ok(prescriptions);
    }
}
