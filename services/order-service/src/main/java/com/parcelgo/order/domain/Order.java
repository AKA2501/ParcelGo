package com.parcelgo.order.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // core
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 32)
    private String status = "CREATED";

    // fulfillment
    @Column(length = 16, nullable = false)
    private String mode = "ON_DEMAND"; // ON_DEMAND|SCHEDULED

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "vehicle_type", length = 16)
    private String vehicleType;

    // pickup
    @Column(name = "pickup_name", length = 120)  private String pickupName;
    @Column(name = "pickup_phone", length = 32)  private String pickupPhone;
    @Column(name = "pickup_addr1", length = 180, nullable = false) private String pickupAddr1;
    @Column(name = "pickup_addr2", length = 180) private String pickupAddr2;
    @Column(name = "pickup_city", length = 80)   private String pickupCity;
    @Column(name = "pickup_state", length = 80)  private String pickupState;
    @Column(name = "pickup_postal", length = 32) private String pickupPostal;
    @Column(name = "pickup_lat", precision = 9, scale = 6) private BigDecimal pickupLat;
    @Column(name = "pickup_lng", precision = 9, scale = 6) private BigDecimal pickupLng;

    // dropoff
    @Column(name = "drop_name", length = 120)  private String dropName;
    @Column(name = "drop_phone", length = 32)  private String dropPhone;
    @Column(name = "drop_addr1", length = 180, nullable = false) private String dropAddr1;
    @Column(name = "drop_addr2", length = 180) private String dropAddr2;
    @Column(name = "drop_city", length = 80)   private String dropCity;
    @Column(name = "drop_state", length = 80)  private String dropState;
    @Column(name = "drop_postal", length = 32) private String dropPostal;
    @Column(name = "drop_lat", precision = 9, scale = 6) private BigDecimal dropLat;
    @Column(name = "drop_lng", precision = 9, scale = 6) private BigDecimal dropLng;

    // package
    @Column(name = "pkg_description", length = 255) private String packageDescription;
    @Column(name = "pkg_weight_kg", precision = 10, scale = 2) private BigDecimal weightKg;
    @Column(name = "pkg_length_cm", precision = 10, scale = 2) private BigDecimal lengthCm;
    @Column(name = "pkg_width_cm", precision = 10, scale = 2)  private BigDecimal widthCm;
    @Column(name = "pkg_height_cm", precision = 10, scale = 2) private BigDecimal heightCm;
    @Column(name = "declared_value", precision = 12, scale = 2) private BigDecimal declaredValue;

    // money & payments
    @Column(length = 3) private String currency = "INR";
    @Column(name = "quoted_amount", precision = 12, scale = 2) private BigDecimal quotedAmount;
    @Column(name = "final_amount", precision = 12, scale = 2)  private BigDecimal finalAmount;
    @Column(name = "payment_method", length = 16) private String paymentMethod; // cod|wallet|card
    @Column(name = "payment_intent_id", length = 100) private String paymentIntentId;
    @Column(name = "promo_code", length = 64) private String promoCode;

    // assignment snapshot
    @Column(name = "courier_id") private Long courierId;
    @Column(name = "vehicle_plate", length = 20) private String vehiclePlate;
    @Column(name = "eta_minutes") private Integer etaMinutes;

    // timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void touch() { this.updatedAt = LocalDateTime.now(); }

    /* ===== Getters & Setters (generated) ===== */
    // -- id
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    // -- user/status
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    // -- fulfillment
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    // -- pickup
    public String getPickupName() { return pickupName; }
    public void setPickupName(String pickupName) { this.pickupName = pickupName; }
    public String getPickupPhone() { return pickupPhone; }
    public void setPickupPhone(String pickupPhone) { this.pickupPhone = pickupPhone; }
    public String getPickupAddr1() { return pickupAddr1; }
    public void setPickupAddr1(String pickupAddr1) { this.pickupAddr1 = pickupAddr1; }
    public String getPickupAddr2() { return pickupAddr2; }
    public void setPickupAddr2(String pickupAddr2) { this.pickupAddr2 = pickupAddr2; }
    public String getPickupCity() { return pickupCity; }
    public void setPickupCity(String pickupCity) { this.pickupCity = pickupCity; }
    public String getPickupState() { return pickupState; }
    public void setPickupState(String pickupState) { this.pickupState = pickupState; }
    public String getPickupPostal() { return pickupPostal; }
    public void setPickupPostal(String pickupPostal) { this.pickupPostal = pickupPostal; }
    public BigDecimal getPickupLat() { return pickupLat; }
    public void setPickupLat(BigDecimal pickupLat) { this.pickupLat = pickupLat; }
    public BigDecimal getPickupLng() { return pickupLng; }
    public void setPickupLng(BigDecimal pickupLng) { this.pickupLng = pickupLng; }
    // -- drop
    public String getDropName() { return dropName; }
    public void setDropName(String dropName) { this.dropName = dropName; }
    public String getDropPhone() { return dropPhone; }
    public void setDropPhone(String dropPhone) { this.dropPhone = dropPhone; }
    public String getDropAddr1() { return dropAddr1; }
    public void setDropAddr1(String dropAddr1) { this.dropAddr1 = dropAddr1; }
    public String getDropAddr2() { return dropAddr2; }
    public void setDropAddr2(String dropAddr2) { this.dropAddr2 = dropAddr2; }
    public String getDropCity() { return dropCity; }
    public void setDropCity(String dropCity) { this.dropCity = dropCity; }
    public String getDropState() { return dropState; }
    public void setDropState(String dropState) { this.dropState = dropState; }
    public String getDropPostal() { return dropPostal; }
    public void setDropPostal(String dropPostal) { this.dropPostal = dropPostal; }
    public BigDecimal getDropLat() { return dropLat; }
    public void setDropLat(BigDecimal dropLat) { this.dropLat = dropLat; }
    public BigDecimal getDropLng() { return dropLng; }
    public void setDropLng(BigDecimal dropLng) { this.dropLng = dropLng; }
    // -- pkg
    public String getPackageDescription() { return packageDescription; }
    public void setPackageDescription(String packageDescription) { this.packageDescription = packageDescription; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    public BigDecimal getLengthCm() { return lengthCm; }
    public void setLengthCm(BigDecimal lengthCm) { this.lengthCm = lengthCm; }
    public BigDecimal getWidthCm() { return widthCm; }
    public void setWidthCm(BigDecimal widthCm) { this.widthCm = widthCm; }
    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }
    public BigDecimal getDeclaredValue() { return declaredValue; }
    public void setDeclaredValue(BigDecimal declaredValue) { this.declaredValue = declaredValue; }
    // -- money
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getQuotedAmount() { return quotedAmount; }
    public void setQuotedAmount(BigDecimal quotedAmount) { this.quotedAmount = quotedAmount; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    // -- assignment
    public Long getCourierId() { return courierId; }
    public void setCourierId(Long courierId) { this.courierId = courierId; }
    public String getVehiclePlate() { return vehiclePlate; }
    public void setVehiclePlate(String vehiclePlate) { this.vehiclePlate = vehiclePlate; }
    public Integer getEtaMinutes() { return etaMinutes; }
    public void setEtaMinutes(Integer etaMinutes) { this.etaMinutes = etaMinutes; }
    // -- timestamps
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
