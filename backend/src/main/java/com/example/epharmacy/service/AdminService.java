package com.example.epharmacy.service;

import com.example.epharmacy.dto.AdminDashboardResponse;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.PaymentStatus;
import com.example.epharmacy.entity.PrescriptionStatus;
import com.example.epharmacy.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;

    public AdminService(OrderRepository orderRepository, UserRepository userRepository,
                        MedicineRepository medicineRepository, PrescriptionRepository prescriptionRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    public AdminDashboardResponse getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> PaymentStatus.PAID.equals(o.getPaymentStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();
        long totalUsers = userRepository.count();
        long totalMedicines = medicineRepository.count();
        long lowStockCount = medicineRepository.findByStockQuantityLessThanEqual(10).size();
        long pendingPrescriptions = prescriptionRepository.findByStatus(PrescriptionStatus.PENDING).size();

        return new AdminDashboardResponse(
                totalRevenue,
                totalOrders,
                totalUsers,
                totalMedicines,
                lowStockCount,
                pendingPrescriptions
        );
    }
}
