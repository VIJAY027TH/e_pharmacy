package com.example.epharmacy.service;

import com.example.epharmacy.dto.CartItemRequest;
import com.example.epharmacy.entity.Cart;
import com.example.epharmacy.entity.CartItem;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.OrderStatus;
import com.example.epharmacy.entity.PaymentStatus;
import com.example.epharmacy.entity.Prescription;
import com.example.epharmacy.entity.PrescriptionStatus;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.CartItemRepository;
import com.example.epharmacy.repository.CartRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.OrderRepository;
import com.example.epharmacy.repository.PrescriptionRepository;
import com.example.epharmacy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final OrderRepository orderRepository;
    private final MedicineQuantityPolicy quantityPolicy;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       MedicineRepository medicineRepository, UserRepository userRepository,
                       PrescriptionRepository prescriptionRepository, OrderRepository orderRepository,
                       MedicineQuantityPolicy quantityPolicy) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.orderRepository = orderRepository;
        this.quantityPolicy = quantityPolicy;
    }

    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Cart cart = new Cart(user);
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public Cart addItemToCart(Long userId, CartItemRequest request) {
        Cart cart = getCartByUserId(userId);
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndMedicineId(cart.getId(), medicine.getId());
        int newQuantity = request.getQuantity() + existingItemOpt.map(CartItem::getQuantity).orElse(0);
        quantityPolicy.validate(medicine, newQuantity, hasValidPrescriptionFor(userId, medicine.getId()));

        if (medicine.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + medicine.getStockQuantity() + ")");
        }

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            if (medicine.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Cannot add item. Total requested quantity (" + newQuantity + ") exceeds available stock (" + medicine.getStockQuantity() + ")");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem(cart, medicine, request.getQuantity(), medicine.getPrice());
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(Long userId, Long itemId, Integer quantity) {
        Cart cart = getCartByUserId(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            quantityPolicy.validate(cartItem.getMedicine(), quantity,
                    hasValidPrescriptionFor(userId, cartItem.getMedicine().getId()));
            if (cartItem.getMedicine().getStockQuantity() < quantity) {
                throw new BadRequestException("Requested quantity exceeds available stock");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(Long userId, Long itemId) {
        Cart cart = getCartByUserId(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());
        cartRepository.save(cart);
    }

    private boolean hasValidPrescriptionFor(Long userId, Long medicineId) {
        return prescriptionRepository.findByUserId(userId).stream()
                .filter(prescription -> prescription.getStatus() == PrescriptionStatus.APPROVED)
                .filter(prescription -> !hasPrescriptionOrder(prescription.getId()))
                .anyMatch(prescription -> prescription.getMedicines().stream()
                        .anyMatch(medicine -> medicine.getId().equals(medicineId)));
    }

    private boolean hasPrescriptionOrder(Long prescriptionId) {
        return orderRepository.findByPrescriptionId(prescriptionId).stream().anyMatch(order -> {
            return order.getOrderStatus() != OrderStatus.CANCELLED
                    && order.getPaymentStatus() != PaymentStatus.REFUNDED
                    && order.getPaymentStatus() != PaymentStatus.FAILED;
        });
    }
}
