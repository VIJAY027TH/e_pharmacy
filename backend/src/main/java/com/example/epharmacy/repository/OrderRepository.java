package com.example.epharmacy.repository;

import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByOrderStatus(OrderStatus orderStatus);
    List<Order> findByPrescriptionId(Long prescriptionId);
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("select o from Order o where o.prescriptionId = :prescriptionId")
    List<Order> findByPrescriptionIdForUpdate(@Param("prescriptionId") Long prescriptionId);
    boolean existsByPrescriptionIdAndOrderStatus(Long prescriptionId, OrderStatus orderStatus);
    List<Order> findAllByOrderByCreatedAtDesc();
}
