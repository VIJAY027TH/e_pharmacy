package com.example.epharmacy.dto;

import java.math.BigDecimal;

public class AdminDashboardResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalUsers;
    private long totalMedicines;
    private long lowStockMedicines;
    private long pendingPrescriptions;

    public AdminDashboardResponse(BigDecimal totalRevenue, long totalOrders, long totalUsers, long totalMedicines, long lowStockMedicines, long pendingPrescriptions) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.totalUsers = totalUsers;
        this.totalMedicines = totalMedicines;
        this.lowStockMedicines = lowStockMedicines;
        this.pendingPrescriptions = pendingPrescriptions;
    }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public long getTotalOrders() { return totalOrders; }
    public long getTotalUsers() { return totalUsers; }
    public long getTotalMedicines() { return totalMedicines; }
    public long getLowStockMedicines() { return lowStockMedicines; }
    public long getPendingPrescriptions() { return pendingPrescriptions; }
}
