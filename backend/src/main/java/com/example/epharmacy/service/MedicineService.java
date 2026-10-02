package com.example.epharmacy.service;

import com.example.epharmacy.dto.MedicineRequest;
import com.example.epharmacy.entity.Category;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.exception.ConflictException;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.CartItemRepository;
import com.example.epharmacy.repository.CategoryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.OrderItemRepository;
import com.example.epharmacy.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ReviewRepository reviewRepository;

    public MedicineService(MedicineRepository medicineRepository,
                           CategoryRepository categoryRepository,
                           OrderItemRepository orderItemRepository,
                           CartItemRepository cartItemRepository,
                           ReviewRepository reviewRepository) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    public List<Medicine> searchMedicines(String query, Long categoryId) {
        if ((query == null || query.isBlank()) && categoryId == null) {
            return medicineRepository.findAll();
        }
        return medicineRepository.searchMedicines(query, categoryId);
    }

    public List<Medicine> getMedicinesByBrand(String brand) {
        return medicineRepository.findByBrandContainingIgnoreCase(brand);
    }

    public List<Medicine> getMedicinesByAilment(String ailment) {
        return medicineRepository.findByAilmentContainingIgnoreCase(ailment);
    }

    public List<Medicine> getLowStockMedicines(Integer threshold) {
        return medicineRepository.findByStockQuantityLessThanEqual(threshold != null ? threshold : 10);
    }

    public Medicine createMedicine(MedicineRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Medicine medicine = new Medicine();
        updateMedicineFields(medicine, request, category);
        return medicineRepository.save(medicine);
    }

    public Medicine updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = getMedicineById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        updateMedicineFields(medicine, request, category);
        return medicineRepository.save(medicine);
    }

    public Medicine updateStock(Long id, Integer quantity) {
        Medicine medicine = getMedicineById(id);
        medicine.setStockQuantity(quantity);
        return medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = getMedicineById(id);

        if (orderItemRepository.existsByMedicineId(id)) {
            throw new ConflictException("Cannot delete this medicine because it is referenced by existing customer orders.");
        }

        if (cartItemRepository.existsByMedicineId(id)) {
            cartItemRepository.deleteByMedicineId(id);
        }

        if (reviewRepository.existsByMedicineId(id)) {
            reviewRepository.deleteByMedicineId(id);
        }

        medicineRepository.delete(medicine);
    }

    private void updateMedicineFields(Medicine medicine, MedicineRequest request, Category category) {
        medicine.setName(request.getName());
        medicine.setBrand(request.getBrand());
        medicine.setComposition(request.getComposition());
        medicine.setDosage(request.getDosage());
        medicine.setUnitType(request.getUnitType());
        medicine.setUnitsPerPack(request.getUnitsPerPack());
        medicine.setDescription(request.getDescription());
        medicine.setPrice(request.getPrice());
        medicine.setStockQuantity(request.getStockQuantity());
        medicine.setCategory(category);
        medicine.setRequiresPrescription(request.getRequiresPrescription() != null ? request.getRequiresPrescription() : false);
        medicine.setImageUrl(request.getImageUrl());
        medicine.setAilment(request.getAilment());
    }
}
