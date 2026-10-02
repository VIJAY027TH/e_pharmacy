package com.example.epharmacy.repository;

import com.example.epharmacy.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndMedicineId(Long cartId, Long medicineId);
    void deleteByCartId(Long cartId);
    boolean existsByMedicineId(Long medicineId);
    void deleteByMedicineId(Long medicineId);
}
