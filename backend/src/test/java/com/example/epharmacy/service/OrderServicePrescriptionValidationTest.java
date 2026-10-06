package com.example.epharmacy.service;

import com.example.epharmacy.dto.OrderRequest;
import com.example.epharmacy.entity.*;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServicePrescriptionValidationTest {

    private static final Long CUSTOMER_ID = 7L;
    private static final Long PRESCRIPTION_ID = 19L;

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private UserRepository userRepository;
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private NotificationRepository notificationRepository;
    private final MedicineQuantityPolicy quantityPolicy = new MedicineQuantityPolicy();

    private OrderService orderService;

    private User customer;
    private Medicine medicine;
    private Cart cart;
    private OrderRequest request;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, orderItemRepository, cartRepository,
                cartItemRepository, medicineRepository, userRepository, prescriptionRepository,
                paymentRepository, deliveryRepository, new NotificationService(notificationRepository),
                quantityPolicy);
        ReflectionTestUtils.setField(quantityPolicy, "quantityLimit", 100L);
        ReflectionTestUtils.setField(quantityPolicy, "prescriptionQuantityLimit", 200L);
        ReflectionTestUtils.setField(orderService, "deliveryEtaMinutes", 3L);
        customer = new User();
        customer.setId(CUSTOMER_ID);
        medicine = new Medicine();
        medicine.setId(31L);
        medicine.setName("Test medicine");
        medicine.setPrice(BigDecimal.TEN);
        medicine.setStockQuantity(10);
        medicine.setUnitsPerPack(1);
        medicine.setRequiresPrescription(true);

        cart = new Cart(customer);
        cart.setId(11L);
        cart.getItems().add(new CartItem(cart, medicine, 1, BigDecimal.TEN));
        request = new OrderRequest();
        request.setShippingAddress("Test address");
        request.setPaymentMethod("CARD");
        request.setPrescriptionId(PRESCRIPTION_ID);

        when(userRepository.findById(CUSTOMER_ID)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(CUSTOMER_ID)).thenReturn(Optional.of(cart));
    }

    @Test
    void rejectsPrescriptionOwnedByAnotherCustomer() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID + 1, LocalDateTime.now().plusDays(1), true);

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void rejectsPendingAndRejectedPrescriptions() {
        for (PrescriptionStatus status : Set.of(
                PrescriptionStatus.PENDING, PrescriptionStatus.REJECTED, PrescriptionStatus.EXPIRED)) {
            mockPrescription(status, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
            assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
            verify(orderRepository, never()).save(any());
        }
    }

    @Test
    void rejectsExpiredStatusAndPrescriptionThatDoesNotCoverRequiredMedicine() {
        mockPrescription(PrescriptionStatus.EXPIRED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));

        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), false);
        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void validApprovedPrescriptionAllowsExactlyTwoHundredIndividualUnitsAtCheckout() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().minusDays(1), true);
        medicine.setRequiresPrescription(false);
        medicine.setUnitsPerPack(20);
        medicine.setUnitType("sachets");
        medicine.setName("MineralCell Complete Complex");
        cart.getItems().get(0).setQuantity(10);
        LocalDateTime createdAt = LocalDateTime.of(2026, 10, 2, 12, 0);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(88L);
                ReflectionTestUtils.setField(order, "createdAt", createdAt);
            }
            return order;
        });
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(cartItemRepository).deleteByCartId(cart.getId());

        assertDoesNotThrow(() -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, times(2)).save(any(Order.class));
        ArgumentCaptor<Delivery> deliveryCaptor = ArgumentCaptor.forClass(Delivery.class);
        verify(deliveryRepository).save(deliveryCaptor.capture());
        assertEquals(createdAt.plusMinutes(3), deliveryCaptor.getValue().getEstimatedDelivery());
    }

    @Test
    void rejectsSevenAuraVitalPacksEvenWithValidPrescription() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
        medicine.setRequiresPrescription(false);
        medicine.setUnitsPerPack(30);
        cart.getItems().get(0).setQuantity(7);

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void rejectsSixMineralCellPacksWithoutPrescriptionAtCheckout() {
        medicine.setRequiresPrescription(false);
        medicine.setName("MineralCell Complete Complex");
        medicine.setUnitType("sachets");
        medicine.setUnitsPerPack(20);
        cart.getItems().get(0).setQuantity(6);
        request.setPrescriptionId(null);

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void rejectsTwelveMineralCellPacksAtCheckoutEvenWithValidPrescription() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
        medicine.setRequiresPrescription(false);
        medicine.setName("MineralCell Complete Complex");
        medicine.setUnitType("sachets");
        medicine.setUnitsPerPack(20);
        cart.getItems().get(0).setQuantity(12);
        medicine.setStockQuantity(1000);

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void rejectsElevenMineralCellPacksAtCheckoutEvenWithValidPrescription() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
        medicine.setRequiresPrescription(false);
        medicine.setName("MineralCell Complete Complex");
        medicine.setUnitType("sachets");
        medicine.setUnitsPerPack(20);
        cart.getItems().get(0).setQuantity(11);
        medicine.setStockQuantity(1000);

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void rejectsPrescriptionAlreadyLinkedToDeliveredOrder() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
        Order deliveredOrder = new Order();
        deliveredOrder.setPrescriptionId(PRESCRIPTION_ID);
        deliveredOrder.setOrderStatus(OrderStatus.DELIVERED);
        when(orderRepository.findByPrescriptionIdForUpdate(PRESCRIPTION_ID)).thenReturn(java.util.List.of(deliveredOrder));

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void rejectsPrescriptionAlreadyReservedByAnotherActiveOrder() {
        mockPrescription(PrescriptionStatus.APPROVED, CUSTOMER_ID, LocalDateTime.now().plusDays(1), true);
        Order activeOrder = new Order();
        activeOrder.setPrescriptionId(PRESCRIPTION_ID);
        activeOrder.setOrderStatus(OrderStatus.PROCESSING);
        activeOrder.setPaymentStatus(PaymentStatus.PAID);
        when(orderRepository.findByPrescriptionIdForUpdate(PRESCRIPTION_ID)).thenReturn(java.util.List.of(activeOrder));

        assertThrows(BadRequestException.class, () -> orderService.createOrder(CUSTOMER_ID, request));
        verify(orderRepository, never()).save(any(Order.class));
    }

    private void mockPrescription(PrescriptionStatus status, Long ownerId, LocalDateTime expiresAt, boolean coversMedicine) {
        User owner = new User();
        owner.setId(ownerId);
        Prescription prescription = new Prescription();
        prescription.setId(PRESCRIPTION_ID);
        prescription.setUser(owner);
        prescription.setStatus(status);
        prescription.setExpiresAt(expiresAt);
        if (coversMedicine) prescription.setMedicines(Set.of(medicine));
        when(prescriptionRepository.findByIdForUpdate(PRESCRIPTION_ID)).thenReturn(Optional.of(prescription));
    }
}
