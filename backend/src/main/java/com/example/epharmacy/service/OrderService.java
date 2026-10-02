package com.example.epharmacy.service;

import com.example.epharmacy.dto.OrderRequest;
import com.example.epharmacy.entity.*;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderService {

    private static final Set<String> ACTIVE_DELIVERY_STATUSES = Set.of(
            "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY");
    private static final Set<OrderStatus> ACTIVE_ORDER_STATUSES = Set.of(
            OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.PACKED,
            OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY);

    @Value("${delivery.eta.minutes}")
    private long deliveryEtaMinutes;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PaymentRepository paymentRepository;
    private final DeliveryRepository deliveryRepository;
    private final NotificationService notificationService;
    private final MedicineQuantityPolicy quantityPolicy;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,
                        MedicineRepository medicineRepository, UserRepository userRepository,
                        PrescriptionRepository prescriptionRepository, PaymentRepository paymentRepository,
                        DeliveryRepository deliveryRepository, NotificationService notificationService,
                        MedicineQuantityPolicy quantityPolicy) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.paymentRepository = paymentRepository;
        this.deliveryRepository = deliveryRepository;
        this.notificationService = notificationService;
        this.quantityPolicy = quantityPolicy;
    }

    @Transactional
    public Order createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot place an order with an empty cart");
        }

        List<Medicine> rxMedicinesInCart = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // 1. Stock & Prescription Validation
        for (CartItem item : cart.getItems()) {
            Medicine med = item.getMedicine();
            if (med.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for medicine: " + med.getName());
            }
            if (Boolean.TRUE.equals(med.getRequiresPrescription())) {
                rxMedicinesInCart.add(med);
            }
            BigDecimal itemSubtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemSubtotal);
        }

        // 2. Validate any selected prescription, then require it to authorize restricted items.
        Prescription prescription = null;
        if (request.getPrescriptionId() != null) {
            prescription = prescriptionRepository.findByIdForUpdate(request.getPrescriptionId())
                    .orElseThrow(() -> new BadRequestException("Prescription not found with id: " + request.getPrescriptionId()));

            if (!prescription.getUser().getId().equals(userId)) {
                throw new BadRequestException("Invalid prescription owner");
            }
            if (!PrescriptionStatus.APPROVED.equals(prescription.getStatus())) {
                throw new BadRequestException("Prescription must be APPROVED before placing order. Current status: " + prescription.getStatus());
            }
            if (hasPrescriptionOrder(prescription.getId())) {
                throw new BadRequestException("This prescription is already linked to an order and cannot be reused.");
            }
        }

        if (!rxMedicinesInCart.isEmpty() && prescription == null) {
            throw new BadRequestException("One or more items require an approved prescription. Please select an approved prescription.");
        }

        if (prescription != null) {
            for (Medicine rxMed : rxMedicinesInCart) {
                boolean covered = prescription.getMedicines().stream()
                        .anyMatch(m -> m.getId().equals(rxMed.getId()));
                if (!covered) {
                    throw new BadRequestException("The selected prescription does not cover all prescription-required medicines in your cart. Uncovered medicine: " + rxMed.getName());
                }
            }
        }

        for (CartItem item : cart.getItems()) {
            boolean covered = prescription != null && prescription.getMedicines().stream()
                    .anyMatch(medicine -> medicine.getId().equals(item.getMedicine().getId()));
            quantityPolicy.validate(item.getMedicine(), item.getQuantity(), covered);
        }

        // 3. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalAmount(totalAmount);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPrescriptionId(request.getPrescriptionId());

        Order savedOrder = orderRepository.save(order);

        // 4. Create OrderItems & Reduce Stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Medicine med = cartItem.getMedicine();
            med.setStockQuantity(med.getStockQuantity() - cartItem.getQuantity());
            medicineRepository.save(med);

            BigDecimal subtotal = cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            OrderItem orderItem = new OrderItem(savedOrder, med, cartItem.getQuantity(), cartItem.getPrice(), subtotal);
            orderItems.add(orderItem);
        }
        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        // 5. Create Mock Payment Record
        PaymentMethod method = PaymentMethod.CARD;
        try {
            if (request.getPaymentMethod() != null) {
                method = PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            method = PaymentMethod.CARD;
        }

        Payment payment = new Payment();
        payment.setOrderId(savedOrder.getId());
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(method);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaymentStatus(PaymentStatus.PAID);
        paymentRepository.save(payment);

        // 6. Create Delivery Record
        Delivery delivery = new Delivery();
        delivery.setOrderId(savedOrder.getId());
        delivery.setTrackingNumber("TRK-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        delivery.setDeliveryStatus("CONFIRMED");
        delivery.setEstimatedDelivery(savedOrder.getCreatedAt().plusMinutes(deliveryEtaMinutes));
        deliveryRepository.save(delivery);

        // 7. Clear Cart
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());
        cartRepository.save(cart);

        // 8. Send Order Confirmation Notification
        notificationService.createNotification(
                user,
                "Order Placed Successfully",
                "Your order #" + savedOrder.getId() + " for $" + totalAmount + " has been confirmed!",
                "ORDER"
        );

        return savedOrder;
    }

    private boolean hasPrescriptionOrder(Long prescriptionId) {
        return orderRepository.findByPrescriptionIdForUpdate(prescriptionId).stream().anyMatch(order -> {
            return order.getOrderStatus() != OrderStatus.CANCELLED
                    && order.getPaymentStatus() != PaymentStatus.REFUNDED
                    && order.getPaymentStatus() != PaymentStatus.FAILED;
        });
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public int deliverDueOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Delivery> dueDeliveries = deliveryRepository
                .findByEstimatedDeliveryLessThanEqualAndDeliveryStatusIn(now, ACTIVE_DELIVERY_STATUSES);
        int deliveredCount = 0;

        for (Delivery delivery : dueDeliveries) {
            Order order = orderRepository.findById(delivery.getOrderId()).orElse(null);
            if (order == null || !ACTIVE_ORDER_STATUSES.contains(order.getOrderStatus())
                    || order.getPaymentStatus() != PaymentStatus.PAID) {
                continue;
            }

            order.setOrderStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);

            delivery.setDeliveryStatus(OrderStatus.DELIVERED.name());
            delivery.setDeliveredAt(now);
            deliveryRepository.save(delivery);

            notificationService.createNotification(
                    order.getUser(),
                    "Order Delivered",
                    "Your order #" + order.getId() + " has been delivered.",
                    "ORDER"
            );
            deliveredCount++;
        }

        return deliveredCount;
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatusStr) {
        Order order = getOrderById(orderId);
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + newStatusStr);
        }

        OrderStatus currentStatus = order.getOrderStatus();

        if (currentStatus == OrderStatus.CANCELLED) {
            if (newStatus == OrderStatus.CANCELLED) {
                throw new BadRequestException("Order is already cancelled.");
            } else {
                throw new BadRequestException("Cancelled orders cannot be transitioned to another status.");
            }
        }

        if (newStatus == OrderStatus.CANCELLED) {
            if (currentStatus == OrderStatus.SHIPPED || currentStatus == OrderStatus.DELIVERED) {
                throw new BadRequestException("Orders that are already SHIPPED or DELIVERED cannot be cancelled.");
            }

            // Restore Medicine Stock
            for (OrderItem item : order.getItems()) {
                Medicine med = item.getMedicine();
                med.setStockQuantity(med.getStockQuantity() + item.getQuantity());
                medicineRepository.save(med);
            }
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        order.setOrderStatus(newStatus);
        Order updated = orderRepository.save(order);

        // Sync Delivery status
        deliveryRepository.findByOrderId(orderId).ifPresent(delivery -> {
            delivery.setDeliveryStatus(newStatus.name());
            if (newStatus == OrderStatus.DELIVERED) {
                delivery.setDeliveredAt(LocalDateTime.now());
            }
            deliveryRepository.save(delivery);
        });

        notificationService.createNotification(
                order.getUser(),
                "Order Status Updated",
                "Your order #" + order.getId() + " is now " + newStatus.name(),
                "ORDER"
        );

        return updated;
    }

    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to user");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled.");
        }

        if (order.getOrderStatus() == OrderStatus.SHIPPED || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Orders that are already SHIPPED or DELIVERED cannot be cancelled.");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);

        // Restore Medicine Stock
        for (OrderItem item : order.getItems()) {
            Medicine med = item.getMedicine();
            med.setStockQuantity(med.getStockQuantity() + item.getQuantity());
            medicineRepository.save(med);
        }

        Order cancelledOrder = orderRepository.save(order);

        notificationService.createNotification(
                order.getUser(),
                "Order Cancelled",
                "Your order #" + order.getId() + " has been cancelled.",
                "ORDER"
        );

        return cancelledOrder;
    }
}
