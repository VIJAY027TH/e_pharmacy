package com.example.epharmacy.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private Long prescriptionId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CARD, UPI, NET_BANKING, WALLET

    public OrderRequest() {}

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
