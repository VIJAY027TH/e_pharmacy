package com.example.epharmacy.service;

import com.example.epharmacy.entity.*;
import com.example.epharmacy.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceDeliverySchedulerTest {

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
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, orderItemRepository, cartRepository,
                cartItemRepository, medicineRepository, userRepository, prescriptionRepository,
                paymentRepository, deliveryRepository, new NotificationService(notificationRepository),
                new MedicineQuantityPolicy());
    }

    @Test
    void deliversDuePaidActiveOrderAndLeavesPaymentStatusUnchanged() {
        User customer = new User();
        Order order = order(OrderStatus.OUT_FOR_DELIVERY, PaymentStatus.PAID, customer);
        Delivery delivery = delivery(1L);
        when(deliveryRepository.findByEstimatedDeliveryLessThanEqualAndDeliveryStatusIn(any(), any()))
                .thenReturn(List.of(delivery));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(1, orderService.deliverDueOrders());
        assertEquals(OrderStatus.DELIVERED, order.getOrderStatus());
        assertEquals(PaymentStatus.PAID, order.getPaymentStatus());
        assertEquals(OrderStatus.DELIVERED.name(), delivery.getDeliveryStatus());
        assertNotNull(delivery.getDeliveredAt());
        verify(orderRepository).save(order);
        verify(deliveryRepository).save(delivery);
    }

    @Test
    void doesNotDeliverCancelledRefundedOrAlreadyDeliveredOrders() {
        Order cancelled = order(OrderStatus.CANCELLED, PaymentStatus.REFUNDED, new User());
        Order refunded = order(OrderStatus.CONFIRMED, PaymentStatus.REFUNDED, new User());
        Order alreadyDelivered = order(OrderStatus.DELIVERED, PaymentStatus.PAID, new User());
        Delivery cancelledDelivery = delivery(1L);
        Delivery refundedDelivery = delivery(2L);
        Delivery deliveredDelivery = delivery(3L);
        when(deliveryRepository.findByEstimatedDeliveryLessThanEqualAndDeliveryStatusIn(any(), any()))
                .thenReturn(List.of(cancelledDelivery, refundedDelivery, deliveredDelivery));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(cancelled));
        when(orderRepository.findById(2L)).thenReturn(Optional.of(refunded));
        when(orderRepository.findById(3L)).thenReturn(Optional.of(alreadyDelivered));

        assertEquals(0, orderService.deliverDueOrders());
        verify(orderRepository, never()).save(any(Order.class));
        verify(deliveryRepository, never()).save(any(Delivery.class));
    }

    private Order order(OrderStatus status, PaymentStatus paymentStatus, User user) {
        Order order = new Order();
        order.setOrderStatus(status);
        order.setPaymentStatus(paymentStatus);
        order.setUser(user);
        return order;
    }

    private Delivery delivery(Long orderId) {
        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        delivery.setDeliveryStatus("CONFIRMED");
        delivery.setEstimatedDelivery(LocalDateTime.now().minusSeconds(1));
        return delivery;
    }
}
