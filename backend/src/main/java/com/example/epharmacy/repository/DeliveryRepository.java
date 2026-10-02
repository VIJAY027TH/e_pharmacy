package com.example.epharmacy.repository;

import com.example.epharmacy.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByOrderId(Long orderId);
    Optional<Delivery> findByTrackingNumber(String trackingNumber);
    List<Delivery> findByEstimatedDeliveryLessThanEqualAndDeliveryStatusIn(
            LocalDateTime estimatedDelivery, Collection<String> deliveryStatuses);
}
