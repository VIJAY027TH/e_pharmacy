package com.example.epharmacy.repository;

import com.example.epharmacy.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByBrandContainingIgnoreCase(String brand);

    List<Medicine> findByAilmentContainingIgnoreCase(String ailment);

    List<Medicine> findByCategoryId(Long categoryId);

    boolean existsByCategoryId(Long categoryId);

    long countByCategoryId(Long categoryId);

    @Query("SELECT m FROM Medicine m WHERE " +
           "(:query IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.brand) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.composition) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.ailment) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId)")
    List<Medicine> searchMedicines(@Param("query") String query, @Param("categoryId") Long categoryId);

    List<Medicine> findByStockQuantityLessThanEqual(Integer threshold);
}
