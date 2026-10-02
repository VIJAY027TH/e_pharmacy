package com.example.epharmacy.controller;

import com.example.epharmacy.dto.ReviewRequest;
import com.example.epharmacy.entity.Review;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.ReviewService;
import com.example.epharmacy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    public ReviewController(ReviewService reviewService, UserService userService) {
        this.reviewService = reviewService;
        this.userService = userService;
    }

    @PostMapping("/api/reviews")
    public ResponseEntity<Review> addReview(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
        User user = userService.getUserByEmail(authentication.getName());
        Review review = reviewService.addReview(user.getId(), request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping("/api/medicines/{medicineId}/reviews")
    public ResponseEntity<List<Review>> getReviewsByMedicineId(@PathVariable Long medicineId) {
        return ResponseEntity.ok(reviewService.getReviewsByMedicineId(medicineId));
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Void> deleteReview(Authentication authentication, @PathVariable Long id) {
        User user = userService.getUserByEmail(authentication.getName());
        reviewService.deleteReview(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
