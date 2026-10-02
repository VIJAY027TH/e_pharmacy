package com.example.epharmacy.controller;

import com.example.epharmacy.entity.Prescription;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.PrescriptionService;
import com.example.epharmacy.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserService userService;

    public PrescriptionController(PrescriptionService prescriptionService, UserService userService) {
        this.prescriptionService = prescriptionService;
        this.userService = userService;
    }

    @PostMapping("/api/prescriptions/upload")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Prescription> uploadPrescription(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "orderId", required = false) Long orderId) {

        User user = userService.getUserByEmail(authentication.getName());
        Prescription prescription = prescriptionService.uploadPrescription(user.getId(), file, orderId);
        return new ResponseEntity<>(prescription, HttpStatus.CREATED);
    }

    @GetMapping("/api/prescriptions")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Prescription>> getUserPrescriptions(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(prescriptionService.getUserPrescriptions(user.getId()));
    }

    @GetMapping("/api/prescriptions/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    // ADMIN ENDPOINTS
    @GetMapping("/api/admin/prescriptions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Prescription>> getAllOrPendingPrescriptions(
            @RequestParam(value = "status", required = false) String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(prescriptionService.getPendingPrescriptions());
        }
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @PutMapping("/api/admin/prescriptions/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Prescription> approvePrescription(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) List<Long> medicineIds) {
        Prescription approved = prescriptionService.approvePrescription(id, authentication.getName(), notes, medicineIds);
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/api/admin/prescriptions/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Prescription> rejectPrescription(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        Prescription rejected = prescriptionService.rejectPrescription(id, authentication.getName(), notes);
        return ResponseEntity.ok(rejected);
    }
}
