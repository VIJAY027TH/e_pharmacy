package com.example.epharmacy.service;

import com.example.epharmacy.entity.Category;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.exception.ConflictException;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.CategoryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public CategoryService(CategoryRepository categoryRepository, MedicineRepository medicineRepository) {
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public long getMedicineCountByCategoryId(Long id) {
        getCategoryById(id);
        return medicineRepository.countByCategoryId(id);
    }

    public Category createCategory(Category category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new BadRequestException("Category with name '" + category.getName() + "' already exists");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id, Long replacementCategoryId) {
        Category categoryToDelete = getCategoryById(id);
        long medicineCount = medicineRepository.countByCategoryId(id);

        if (medicineCount > 0) {
            if (replacementCategoryId == null) {
                throw new BadRequestException("Category contains " + medicineCount +
                        " medicines. A replacement category must be specified for reassignment before deleting.");
            }
            if (id.equals(replacementCategoryId)) {
                throw new BadRequestException("Replacement category cannot be the same as the category being deleted.");
            }
            Category replacementCategory = categoryRepository.findById(replacementCategoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Replacement category not found with id: " + replacementCategoryId));

            List<Medicine> medicinesToMove = medicineRepository.findByCategoryId(id);
            for (Medicine medicine : medicinesToMove) {
                medicine.setCategory(replacementCategory);
            }
            medicineRepository.saveAll(medicinesToMove);
        }

        categoryRepository.delete(categoryToDelete);
    }

    @Transactional
    public void deleteCategory(Long id) {
        deleteCategory(id, null);
    }
}
