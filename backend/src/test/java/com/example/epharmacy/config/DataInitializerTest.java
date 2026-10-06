package com.example.epharmacy.config;

import com.example.epharmacy.entity.Category;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.RoleName;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.repository.CategoryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(userRepository, categoryRepository, medicineRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Fails fast when no admin exists and PHARMAVITAL_ADMIN_PASSWORD is missing")
    void testThrowsExceptionWhenAdminPasswordMissing() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            dataInitializer.run();
        });

        assertTrue(ex.getMessage().contains("PHARMAVITAL_ADMIN_PASSWORD"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Successfully creates admin using PHARMAVITAL_ADMIN_PASSWORD when configured")
    void testCreatesAdminWhenPasswordProvided() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(categoryRepository.count()).thenReturn(7L);
        when(passwordEncoder.encode("TestSecret123")).thenReturn("hashed_secret");

        dataInitializer.setAdminPassword("TestSecret123");
        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedAdmin = userCaptor.getValue();
        assertEquals("PharmaVital Admin", savedAdmin.getName());
        assertEquals("admin@pharmavital.com", savedAdmin.getEmail());
        assertEquals("hashed_secret", savedAdmin.getPassword());
        assertEquals(RoleName.ROLE_ADMIN, savedAdmin.getRole());
    }

    @Test
    @DisplayName("Seeds authoritative 14 medicines with exact unitsPerPack and unitType when catalog is empty")
    void testSeedsCatalogWithAuthoritativePackageData() {
        User existingAdmin = new User("Admin", "admin@pharmavital.com", "hash", null, null, RoleName.ROLE_ADMIN);
        when(userRepository.findAll()).thenReturn(List.of(existingAdmin));
        when(categoryRepository.count()).thenReturn(0L);
        when(medicineRepository.count()).thenReturn(0L);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        dataInitializer.run();

        ArgumentCaptor<Medicine> medicineCaptor = ArgumentCaptor.forClass(Medicine.class);
        verify(medicineRepository, times(14)).save(medicineCaptor.capture());

        List<Medicine> seeded = medicineCaptor.getAllValues();
        assertEquals(14, seeded.size());

        // Verify representative package data
        Medicine auraVital = seeded.stream().filter(m -> m.getName().equals("AuraVital Complete")).findFirst().orElseThrow();
        assertEquals(30, auraVital.getUnitsPerPack());
        assertEquals("tablets", auraVital.getUnitType());

        Medicine bronchoMist = seeded.stream().filter(m -> m.getName().equals("BronchoClear Isotonic Mist")).findFirst().orElseThrow();
        assertEquals(100, bronchoMist.getUnitsPerPack());
        assertEquals("ml", bronchoMist.getUnitType());

        Medicine ceramideCream = seeded.stream().filter(m -> m.getName().equals("CeramideBarrier Intensive Cream")).findFirst().orElseThrow();
        assertEquals(200, ceramideCream.getUnitsPerPack());
        assertEquals("ml", ceramideCream.getUnitType());
    }
}
