package com.example.epharmacy.controller;

import com.example.epharmacy.dto.OrderRequest;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.OrderService;
import com.example.epharmacy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping("/api/orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> createOrder(Authentication authentication, @Valid @RequestBody OrderRequest request) {
        User user = userService.getUserByEmail(authentication.getName());
        Order order = orderService.createOrder(user.getId(), request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/api/orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(orderService.getUserOrders(user.getId()));
    }

    @GetMapping("/api/orders/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/api/orders/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> cancelOrder(Authentication authentication, @PathVariable Long id) {
        User user = userService.getUserByEmail(authentication.getName());
        Order cancelled = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(cancelled);
    }

    // ADMIN ENDPOINTS
    @GetMapping("/api/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/api/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
