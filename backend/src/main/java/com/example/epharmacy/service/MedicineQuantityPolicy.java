package com.example.epharmacy.service;

import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MedicineQuantityPolicy {

    @Value("${medicine.quantity.limit}")
    private long quantityLimit;

    @Value("${medicine.prescription.quantity.limit:200}")
    private long prescriptionQuantityLimit;

    public boolean exceedsLimit(Medicine medicine, int packQuantity) {
        return (long) packQuantity * medicine.getUnitsPerPack() > quantityLimit;
    }

    public void validate(Medicine medicine, int packQuantity, boolean hasValidPrescription) {
        long individualUnits = (long) packQuantity * medicine.getUnitsPerPack();
        if (hasValidPrescription && individualUnits > prescriptionQuantityLimit) {
            throw new BadRequestException("Prescription quantity limit exceeded. The maximum is "
                    + prescriptionQuantityLimit + " individual " + medicine.getUnitType() + " per order.");
        }
        if (individualUnits > quantityLimit && !hasValidPrescription) {
            long maximumPacks = quantityLimit / medicine.getUnitsPerPack();
            throw new BadRequestException("Quantity limit exceeded. You can purchase up to "
                    + maximumPacks + " packs (" + quantityLimit + " " + medicine.getUnitType()
                    + ") without an approved prescription. Please provide an approved prescription "
                    + "authorizing this medicine to purchase more.");
        }
    }

    public long getQuantityLimit() {
        return quantityLimit;
    }
}
