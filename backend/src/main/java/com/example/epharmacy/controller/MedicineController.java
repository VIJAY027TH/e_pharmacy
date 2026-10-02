package com.example.epharmacy.controller;

import com.example.epharmacy.dto.MedicineRequest;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String ailment,
            @RequestParam(required = false) Long categoryId) {

        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(medicineService.searchMedicines(name, categoryId));
        }
        if (brand != null && !brand.isBlank()) {
            return ResponseEntity.ok(medicineService.getMedicinesByBrand(brand));
        }
        if (ailment != null && !ailment.isBlank()) {
            return ResponseEntity.ok(medicineService.getMedicinesByAilment(ailment));
        }

        return ResponseEntity.ok(medicineService.searchMedicines(query, categoryId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medicine> createMedicine(@Valid @RequestBody MedicineRequest request) {
        Medicine created = medicineService.createMedicine(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        Medicine updated = medicineService.updateMedicine(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}
