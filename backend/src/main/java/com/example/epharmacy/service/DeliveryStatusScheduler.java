package com.example.epharmacy.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DeliveryStatusScheduler {

    private final OrderService orderService;
    private final PrescriptionService prescriptionService;

    public DeliveryStatusScheduler(OrderService orderService, PrescriptionService prescriptionService) {
        this.orderService = orderService;
        this.prescriptionService = prescriptionService;
    }

    @Scheduled(fixedDelayString = "${delivery.status.check-interval-ms}")
    public void deliverDueOrders() {
        orderService.deliverDueOrders();
        prescriptionService.consumeDeliveredPrescriptions(LocalDateTime.now());
    }
}
