package com.example.epharmacy.controller;

import com.example.epharmacy.entity.Notification;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.NotificationService;
import com.example.epharmacy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(Authentication authentication, @PathVariable Long id) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.markAsRead(id, user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }
}
