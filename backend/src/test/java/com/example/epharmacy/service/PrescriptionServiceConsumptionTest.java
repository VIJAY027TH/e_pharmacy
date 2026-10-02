package com.example.epharmacy.service;

import com.example.epharmacy.entity.Delivery;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.OrderStatus;
import com.example.epharmacy.entity.PaymentStatus;
import com.example.epharmacy.entity.Prescription;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.DeliveryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.NotificationRepository;
import com.example.epharmacy.repository.OrderRepository;
import com.example.epharmacy.repository.PrescriptionRepository;
import com.example.epharmacy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceConsumptionTest {

    @TempDir Path uploadDirectory;

    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private UserRepository userRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private DeliveryRepository deliveryRepository;

    private PrescriptionService prescriptionService;
    private Prescription prescription;
    private Order deliveredOrder;
    private Delivery delivery;
    private Path physicalFile;
    private final LocalDateTime deliveredAt = LocalDateTime.of(2026, 10, 2, 12, 0);

    @BeforeEach
    void setUp() throws Exception {
        prescriptionService = new PrescriptionService(prescriptionRepository, userRepository,
                medicineRepository, new NotificationService(notificationRepository),
                orderRepository, deliveryRepository);
        ReflectionTestUtils.setField(prescriptionService, "uploadDirectory", uploadDirectory.toString());

        prescription = new Prescription();
        prescription.setId(50L);
        prescription.setFileUrl("/uploads/prescriptions/test-prescription.pdf");
        physicalFile = uploadDirectory.resolve("test-prescription.pdf");
        Files.writeString(physicalFile, "test-only");

        deliveredOrder = order(101L, OrderStatus.DELIVERED, PaymentStatus.PAID);
        delivery = new Delivery();
        delivery.setOrderId(101L);
        delivery.setDeliveryStatus("DELIVERED");
        delivery.setDeliveredAt(deliveredAt);

        lenient().when(orderRepository.findByOrderStatus(OrderStatus.DELIVERED)).thenReturn(List.of(deliveredOrder));
        lenient().when(orderRepository.findByPrescriptionId(50L)).thenReturn(List.of(deliveredOrder));
        lenient().when(prescriptionRepository.findById(50L)).thenReturn(Optional.of(prescription));
        lenient().when(deliveryRepository.findByOrderId(101L)).thenReturn(Optional.of(delivery));
    }

    @Test
    void keepsPrescriptionUntilFiveSecondsAfterDeliveryThenRemovesRecordAndFile() {
        assertEquals(0, prescriptionService.consumeDeliveredPrescriptions(deliveredAt.plusSeconds(4)));
        assertTrue(Files.exists(physicalFile));
        verify(prescriptionRepository, never()).delete(prescription);

        assertEquals(1, prescriptionService.consumeDeliveredPrescriptions(deliveredAt.plusSeconds(5)));
        assertTrue(prescription.getMedicines().isEmpty());
        verify(prescriptionRepository).delete(prescription);
        assertFalse(Files.exists(physicalFile));
    }

    @Test
    void waitsWhilePrescriptionIsLinkedToAnotherActiveOrder() {
        Order activeOrder = order(102L, OrderStatus.PROCESSING, PaymentStatus.PAID);
        when(orderRepository.findByPrescriptionId(50L)).thenReturn(List.of(deliveredOrder, activeOrder));

        assertEquals(0, prescriptionService.consumeDeliveredPrescriptions(deliveredAt.plusSeconds(10)));
        verify(prescriptionRepository, never()).delete(prescription);
        assertTrue(Files.exists(physicalFile));
    }

    @Test
    void doesNotConsumePrescriptionForCancelledOrRefundedOrders() {
        when(orderRepository.findByOrderStatus(OrderStatus.DELIVERED)).thenReturn(List.of());

        assertEquals(0, prescriptionService.consumeDeliveredPrescriptions(deliveredAt.plusMinutes(10)));
        verify(prescriptionRepository, never()).delete(prescription);
    }

    @Test
    void doesNotConsumePrescriptionForDeliveredButRefundedOrder() {
        deliveredOrder.setPaymentStatus(PaymentStatus.REFUNDED);

        assertEquals(0, prescriptionService.consumeDeliveredPrescriptions(deliveredAt.plusMinutes(10)));
        verify(prescriptionRepository, never()).delete(prescription);
        assertTrue(Files.exists(physicalFile));
    }

    @Test
    void consumedPrescriptionIsHiddenFromCustomerAndAdminAndCannotBeFetched() {
        when(prescriptionRepository.findByUserIdOrderByUploadedAtDescIdDesc(9L)).thenReturn(List.of(prescription));
        when(prescriptionRepository.findAllByOrderByUploadedAtDescIdDesc()).thenReturn(List.of(prescription));

        assertTrue(prescriptionService.getUserPrescriptions(9L).isEmpty());
        assertTrue(prescriptionService.getAllPrescriptions().isEmpty());
        assertThrows(ResourceNotFoundException.class, () -> prescriptionService.getPrescriptionById(50L));
    }

    private Order order(Long id, OrderStatus status, PaymentStatus paymentStatus) {
        Order order = new Order();
        order.setId(id);
        order.setPrescriptionId(50L);
        order.setOrderStatus(status);
        order.setPaymentStatus(paymentStatus);
        return order;
    }
}
