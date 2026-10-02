package com.example.epharmacy.service;

import com.example.epharmacy.dto.CartItemRequest;
import com.example.epharmacy.entity.*;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceQuantityLimitTest {

    private static final Long USER_ID = 12L;
    private static final Long MEDICINE_ID = 43L;

    @Mock private CartItemRepository cartItemRepository;
    @Mock private CartRepository cartRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private UserRepository userRepository;
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private OrderRepository orderRepository;

    private CartService cartService;
    private User user;
    private Medicine medicine;
    private Cart cart;

    @BeforeEach
    void setUp() {
        MedicineQuantityPolicy quantityPolicy = new MedicineQuantityPolicy();
        ReflectionTestUtils.setField(quantityPolicy, "quantityLimit", 100L);
        ReflectionTestUtils.setField(quantityPolicy, "prescriptionQuantityLimit", 200L);
        cartService = new CartService(cartRepository, cartItemRepository, medicineRepository,
                userRepository, prescriptionRepository, orderRepository, quantityPolicy);

        user = new User();
        user.setId(USER_ID);
        medicine = new Medicine();
        medicine.setId(MEDICINE_ID);
        medicine.setName("VitaCore Daily");
        medicine.setUnitType("tablets");
        medicine.setUnitsPerPack(30);
        medicine.setPrice(new BigDecimal("18.50"));
        medicine.setStockQuantity(80);
        medicine.setRequiresPrescription(false);
        cart = new Cart(user);
        cart.setId(6L);

        when(cartRepository.findByUserId(USER_ID)).thenReturn(Optional.of(cart));
        when(medicineRepository.findById(MEDICINE_ID)).thenReturn(Optional.of(medicine));
        when(cartItemRepository.findByCartIdAndMedicineId(cart.getId(), MEDICINE_ID)).thenReturn(Optional.empty());
    }

    @Test
    void allowsThreeVitaCorePacksAtNinetyUnits() {
        stubCartSaves();
        cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 3));

        assertEquals(3, cart.getItems().get(0).getQuantity());
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void rejectsFourVitaCorePacksAtOneHundredTwentyUnitsWithoutPrescription() {
        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 4)));

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    void allowsFourVitaCorePacksWithApprovedUnexpiredCoveringPrescription() {
        stubCartSaves();
        Prescription prescription = new Prescription();
        prescription.setStatus(PrescriptionStatus.APPROVED);
        prescription.setExpiresAt(LocalDateTime.now().plusDays(2));
        prescription.setMedicines(Set.of(medicine));
        when(prescriptionRepository.findByUserId(USER_ID)).thenReturn(List.of(prescription));

        cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 4));

        assertEquals(4, cart.getItems().get(0).getQuantity());
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void allowsSixVitaCorePacksButRejectsSevenWithPrescription() {
        Prescription prescription = new Prescription();
        prescription.setId(65L);
        prescription.setStatus(PrescriptionStatus.APPROVED);
        prescription.setExpiresAt(LocalDateTime.now().plusDays(2));
        prescription.setMedicines(Set.of(medicine));
        when(prescriptionRepository.findByUserId(USER_ID)).thenReturn(List.of(prescription));
        stubCartSaves();

        cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 6));
        assertEquals(6, cart.getItems().get(0).getQuantity());

        cart.getItems().clear();
        when(cartItemRepository.findByCartIdAndMedicineId(cart.getId(), MEDICINE_ID)).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 7)));
    }

    @Test
    void deliveredPrescriptionCannotAuthorizeCartQuantity() {
        Prescription prescription = new Prescription();
        prescription.setId(66L);
        prescription.setStatus(PrescriptionStatus.APPROVED);
        prescription.setExpiresAt(LocalDateTime.now().plusDays(2));
        prescription.setMedicines(Set.of(medicine));
        when(prescriptionRepository.findByUserId(USER_ID)).thenReturn(List.of(prescription));
        Order deliveredOrder = new Order();
        deliveredOrder.setPrescriptionId(66L);
        deliveredOrder.setOrderStatus(OrderStatus.DELIVERED);
        when(orderRepository.findByPrescriptionId(66L)).thenReturn(List.of(deliveredOrder));

        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 4)));
    }

    @Test
    void appliesHydraCareLimitWithoutPrescriptionAtCartApiBoundary() {
        medicine.setName("HydraCare Mineral");
        medicine.setUnitType("sachets");
        medicine.setUnitsPerPack(20);
        stubCartSaves();

        cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 5));
        assertEquals(5, cart.getItems().get(0).getQuantity());

        cart.getItems().clear();
        when(cartItemRepository.findByCartIdAndMedicineId(cart.getId(), MEDICINE_ID)).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 6)));
    }

    @Test
    void enforcesHydraCareTwoHundredUnitPrescriptionCeilingAtCartApiBoundary() {
        medicine.setName("HydraCare Mineral");
        medicine.setUnitType("sachets");
        medicine.setUnitsPerPack(20);
        Prescription prescription = new Prescription();
        prescription.setId(67L);
        prescription.setStatus(PrescriptionStatus.APPROVED);
        prescription.setExpiresAt(LocalDateTime.now().minusDays(1));
        prescription.setMedicines(Set.of(medicine));
        when(prescriptionRepository.findByUserId(USER_ID)).thenReturn(List.of(prescription));
        stubCartSaves();

        cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 10));
        assertEquals(10, cart.getItems().get(0).getQuantity());

        cart.getItems().clear();
        when(cartItemRepository.findByCartIdAndMedicineId(cart.getId(), MEDICINE_ID)).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 11)));
        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(USER_ID, new CartItemRequest(MEDICINE_ID, 12)));
    }

    private void stubCartSaves() {
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }
}
