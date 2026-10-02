package com.example.epharmacy.controller;

import com.example.epharmacy.dto.AdminDashboardResponse;
import com.example.epharmacy.dto.UserResponse;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.AdminService;
import com.example.epharmacy.service.MedicineService;
import com.example.epharmacy.service.OrderService;
import com.example.epharmacy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final OrderService orderService;
    private final MedicineService medicineService;

    public AdminController(AdminService adminService, UserService userService,
                           OrderService orderService, MedicineService medicineService) {
        this.adminService = adminService;
        this.userService = userService;
        this.orderService = orderService;
        this.medicineService = medicineService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> responses = users.stream().map(UserResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        User updated = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(new UserResponse(updated));
    }

    @GetMapping("/reports/sales")
    public ResponseEntity<List<Order>> getSalesReport() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/reports/inventory")
    public ResponseEntity<List<Medicine>> getInventoryReport() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/reports/popular-medicines")
    public ResponseEntity<List<Medicine>> getPopularMedicinesReport() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }
}
