package com.example.epharmacy.repository;

import com.example.epharmacy.entity.Prescription;
import com.example.epharmacy.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Prescription p where p.id = :id")
    Optional<Prescription> findByIdForUpdate(@Param("id") Long id);

    List<Prescription> findByUserId(Long userId);
    List<Prescription> findByUserIdOrderByUploadedAtDescIdDesc(Long userId);
    List<Prescription> findByStatus(PrescriptionStatus status);
    List<Prescription> findByStatusOrderByUploadedAtDescIdDesc(PrescriptionStatus status);
    List<Prescription> findAllByOrderByUploadedAtDescIdDesc();
}
