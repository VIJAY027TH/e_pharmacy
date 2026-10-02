package com.example.epharmacy.repository;

import com.example.epharmacy.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMedicineIdOrderByCreatedAtDesc(Long medicineId);
    List<Review> findByUserId(Long userId);
    boolean existsByMedicineId(Long medicineId);
    void deleteByMedicineId(Long medicineId);
}
