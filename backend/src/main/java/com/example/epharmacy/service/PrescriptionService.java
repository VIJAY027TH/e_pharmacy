package com.example.epharmacy.service;

import com.example.epharmacy.entity.Delivery;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.Order;
import com.example.epharmacy.entity.OrderStatus;
import com.example.epharmacy.entity.PaymentStatus;
import com.example.epharmacy.entity.Prescription;
import com.example.epharmacy.entity.PrescriptionStatus;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.exception.BadRequestException;
import com.example.epharmacy.exception.ResourceNotFoundException;
import com.example.epharmacy.repository.DeliveryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.OrderRepository;
import com.example.epharmacy.repository.PrescriptionRepository;
import com.example.epharmacy.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class PrescriptionService {

    private static final Logger logger = LoggerFactory.getLogger(PrescriptionService.class);
    private static final String UPLOADED_PRESCRIPTION_PREFIX = "/uploads/prescriptions/";
    private static final long PRESCRIPTION_CONSUMPTION_DELAY_SECONDS = 5;

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final NotificationService notificationService;
    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;

    @Value("${upload.directory:uploads/prescriptions}")
    private String uploadDirectory;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               UserRepository userRepository,
                               MedicineRepository medicineRepository,
                               NotificationService notificationService,
                               OrderRepository orderRepository,
                               DeliveryRepository deliveryRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
        this.notificationService = notificationService;
        this.orderRepository = orderRepository;
        this.deliveryRepository = deliveryRepository;
    }

    /**
     * Deletes prescriptions five seconds after every order that used them has been delivered.
     * A prescription is retained while another linked order is active.
     */
    @Transactional
    public int consumeDeliveredPrescriptions(LocalDateTime now) {
        Set<Long> processedPrescriptionIds = new HashSet<>();
        int consumed = 0;

        for (Order deliveredOrder : orderRepository.findByOrderStatus(OrderStatus.DELIVERED)) {
            Long prescriptionId = deliveredOrder.getPrescriptionId();
            if (prescriptionId == null || !processedPrescriptionIds.add(prescriptionId)) continue;

            Prescription prescription = prescriptionRepository.findById(prescriptionId).orElse(null);
            if (prescription == null) continue;

            if (!isConsumptionDue(prescriptionId, now)) continue;

            Path physicalFile = resolvePrescriptionFile(prescription.getFileUrl());
            prescription.getMedicines().clear();
            prescriptionRepository.delete(prescription);
            deleteFileAfterCommit(physicalFile);
            consumed++;
        }

        return consumed;
    }

    private boolean isConsumptionDue(Long prescriptionId, LocalDateTime now) {
        List<Order> linkedOrders = orderRepository.findByPrescriptionId(prescriptionId);
        if (linkedOrders.isEmpty() || linkedOrders.stream().anyMatch(this::isActiveOrder)) return false;

        boolean hasDeliveredOrder = false;
        for (Order linkedOrder : linkedOrders) {
            if (linkedOrder.getOrderStatus() != OrderStatus.DELIVERED
                    || linkedOrder.getPaymentStatus() == PaymentStatus.REFUNDED
                    || linkedOrder.getPaymentStatus() == PaymentStatus.FAILED) continue;
            hasDeliveredOrder = true;
            Delivery delivery = deliveryRepository.findByOrderId(linkedOrder.getId()).orElse(null);
            if (delivery == null || !OrderStatus.DELIVERED.name().equals(delivery.getDeliveryStatus())
                    || delivery.getDeliveredAt() == null
                    || delivery.getDeliveredAt().plusSeconds(PRESCRIPTION_CONSUMPTION_DELAY_SECONDS).isAfter(now)) {
                return false;
            }
        }
        return hasDeliveredOrder;
    }

    private boolean isActiveOrder(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED
                || order.getPaymentStatus() == PaymentStatus.REFUNDED
                || order.getPaymentStatus() == PaymentStatus.FAILED) {
            return false;
        }
        return order.getOrderStatus() != OrderStatus.DELIVERED;
    }

    private boolean isUnavailableForSelection(Long prescriptionId, LocalDateTime now) {
        return orderRepository.findByPrescriptionId(prescriptionId).stream().anyMatch(this::isActiveOrder)
                || isConsumptionDue(prescriptionId, now);
    }

    private Path resolvePrescriptionFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith(UPLOADED_PRESCRIPTION_PREFIX)) return null;
        String relativePath = fileUrl.substring(UPLOADED_PRESCRIPTION_PREFIX.length());
        if (relativePath.isBlank()) return null;

        Path directory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        Path file = directory.resolve(relativePath).normalize();
        return file.startsWith(directory) && !file.equals(directory) ? file : null;
    }

    private void deleteFileAfterCommit(Path file) {
        if (file == null) return;
        Runnable deleteFile = () -> {
            try {
                Files.deleteIfExists(file);
            } catch (IOException exception) {
                logger.warn("Could not remove consumed prescription file {}", file, exception);
            }
        };

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deleteFile.run();
                }
            });
        } else {
            deleteFile.run();
        }
    }

    public Prescription uploadPrescription(Long userId, MultipartFile file, Long orderId) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            File dir = new File(uploadDirectory);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDirectory, filename);
            Files.copy(file.getInputStream(), path);

            Prescription prescription = new Prescription();
            prescription.setUser(user);
            prescription.setOrderId(orderId);
            prescription.setFileUrl("/uploads/prescriptions/" + filename);
            prescription.setStatus(PrescriptionStatus.PENDING);

            Prescription saved = prescriptionRepository.save(prescription);

            notificationService.createNotification(
                    user,
                    "Prescription Uploaded",
                    "Your prescription #" + saved.getId() + " has been submitted for verification.",
                    "PRESCRIPTION"
            );

            return saved;

        } catch (IOException e) {
            throw new RuntimeException("Could not store the prescription file: " + e.getMessage());
        }
    }

    public List<Prescription> getUserPrescriptions(Long userId) {
        return prescriptionRepository.findByUserIdOrderByUploadedAtDescIdDesc(userId).stream()
                .filter(prescription -> !isUnavailableForSelection(prescription.getId(), LocalDateTime.now()))
                .toList();
    }

    public List<Prescription> getPendingPrescriptions() {
        return prescriptionRepository.findByStatusOrderByUploadedAtDescIdDesc(PrescriptionStatus.PENDING);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAllByOrderByUploadedAtDescIdDesc().stream()
                .filter(prescription -> !isConsumptionDue(prescription.getId(), LocalDateTime.now()))
                .toList();
    }

    public Prescription getPrescriptionById(Long id) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
        if (isConsumptionDue(id, LocalDateTime.now())) {
            throw new ResourceNotFoundException("Prescription has been consumed");
        }
        return p;
    }

    @Transactional
    public Prescription approvePrescription(Long id, String adminEmail, String notes, List<Long> medicineIds) {
        if (medicineIds == null || medicineIds.isEmpty()) {
            throw new BadRequestException("At least one medicine covered by this prescription must be selected.");
        }

        Prescription prescription = getPrescriptionById(id);
        List<Medicine> coveredMedicines = medicineRepository.findAllById(medicineIds);
        if (coveredMedicines.isEmpty()) {
            throw new BadRequestException("Selected medicines not found for prescription approval.");
        }

        prescription.setStatus(PrescriptionStatus.APPROVED);
        prescription.setVerifiedAt(LocalDateTime.now());
        prescription.setVerifiedBy(adminEmail);
        prescription.setExpiresAt(null);
        prescription.setNotes(notes);
        prescription.setMedicines(new HashSet<>(coveredMedicines));

        Prescription saved = prescriptionRepository.save(prescription);

        notificationService.createNotification(
                prescription.getUser(),
                "Prescription Approved",
                "Your prescription #" + saved.getId() + " has been approved for the selected medicines.",
                "PRESCRIPTION"
        );

        return saved;
    }

    @Transactional
    public Prescription rejectPrescription(Long id, String adminEmail, String notes) {
        Prescription prescription = getPrescriptionById(id);
        prescription.setStatus(PrescriptionStatus.REJECTED);
        prescription.setVerifiedAt(LocalDateTime.now());
        prescription.setVerifiedBy(adminEmail);
        prescription.setNotes(notes);

        Prescription saved = prescriptionRepository.save(prescription);

        notificationService.createNotification(
                prescription.getUser(),
                "Prescription Rejected",
                "Your prescription #" + saved.getId() + " was rejected. Reason: " + (notes != null ? notes : "Invalid document"),
                "PRESCRIPTION"
        );

        return saved;
    }
}
