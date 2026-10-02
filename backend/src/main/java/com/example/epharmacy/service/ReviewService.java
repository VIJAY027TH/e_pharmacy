package com.example.epharmacy.service;

import com.example.epharmacy.dto.ReviewRequest;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.Review;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.ReviewRepository;
import com.example.epharmacy.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, MedicineRepository medicineRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
    }

    public Review addReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

        Review review = new Review();
        review.setUser(user);
        review.setMedicine(medicine);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByMedicineId(Long medicineId) {
        return reviewRepository.findByMedicineIdOrderByCreatedAtDesc(medicineId);
    }

    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (!review.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Review not found");
        }
        reviewRepository.delete(review);
    }
}
