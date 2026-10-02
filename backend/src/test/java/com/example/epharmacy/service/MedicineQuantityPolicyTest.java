package com.example.epharmacy.service;

import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MedicineQuantityPolicyTest {

    private MedicineQuantityPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new MedicineQuantityPolicy();
        ReflectionTestUtils.setField(policy, "quantityLimit", 100L);
        ReflectionTestUtils.setField(policy, "prescriptionQuantityLimit", 200L);
    }

    @Test
    void enforcesIndividualUnitBoundaryUsingStructuredPackInformation() {
        Medicine thirtyTablets = medicine("tablets", 30);
        Medicine twentyCapsules = medicine("capsules", 20);
        Medicine sixtyTablets = medicine("tablets", 60);

        assertDoesNotThrow(() -> policy.validate(thirtyTablets, 3, false));
        assertThrows(BadRequestException.class, () -> policy.validate(thirtyTablets, 4, false));
        assertDoesNotThrow(() -> policy.validate(twentyCapsules, 5, false));
        assertThrows(BadRequestException.class, () -> policy.validate(twentyCapsules, 6, false));
        assertDoesNotThrow(() -> policy.validate(sixtyTablets, 1, false));
        assertThrows(BadRequestException.class, () -> policy.validate(sixtyTablets, 2, false));
    }

    @Test
    void validCoveringPrescriptionOverridesTheUnitLimitButNeverTheTwoHundredUnitCap() {
        Medicine medicine = medicine("tablets", 30);

        assertDoesNotThrow(() -> policy.validate(medicine, 4, true));
        assertDoesNotThrow(() -> policy.validate(medicine, 6, true));
        assertThrows(BadRequestException.class, () -> policy.validate(medicine, 7, true));

        Medicine singleUnits = medicine("units", 1);
        assertDoesNotThrow(() -> policy.validate(singleUnits, 200, true));
        assertThrows(BadRequestException.class, () -> policy.validate(singleUnits, 201, true));
    }

    private Medicine medicine(String unitType, int unitsPerPack) {
        Medicine medicine = new Medicine();
        medicine.setUnitType(unitType);
        medicine.setUnitsPerPack(unitsPerPack);
        return medicine;
    }
}
