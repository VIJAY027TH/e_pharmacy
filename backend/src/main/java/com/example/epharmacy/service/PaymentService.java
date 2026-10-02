package com.example.epharmacy.service;

import com.example.epharmacy.entity.Payment;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order id: " + orderId));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
