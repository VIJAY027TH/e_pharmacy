package com.example.epharmacy.service;

import com.example.epharmacy.entity.Delivery;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.DeliveryRepository;
import org.springframework.stereotype.Service;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    public Delivery getDeliveryByOrderId(Long orderId) {
        return deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery tracking not found for order id: " + orderId));
    }

    public Delivery getDeliveryByTrackingNumber(String trackingNumber) {
        return deliveryRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery tracking not found for tracking number: " + trackingNumber));
    }
}
