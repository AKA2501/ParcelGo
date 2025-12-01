package com.parcelgo.order.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "orders")
public class Order {

    /* ===== Getters & Setters (generated) ===== */
    // -- id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // -- user/status
    // core
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 32)
    private String status = "CREATED";

    // -- fulfillment
    // fulfillment
    @Column(length = 16, nullable = false)
    private String mode = "ON_DEMAND"; // ON_DEMAND|SCHEDULED

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "vehicle_type", length = 16)
    private String vehicleType;

    // -- pickup
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

    // -- drop
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

    // -- pkg
    // package
    @Column(name = "pkg_description", length = 255) private String packageDescription;
    @Column(name = "pkg_weight_kg", precision = 10, scale = 2) private BigDecimal weightKg;
    @Column(name = "pkg_length_cm", precision = 10, scale = 2) private BigDecimal lengthCm;
    @Column(name = "pkg_width_cm", precision = 10, scale = 2)  private BigDecimal widthCm;
    @Column(name = "pkg_height_cm", precision = 10, scale = 2) private BigDecimal heightCm;
    @Column(name = "declared_value", precision = 12, scale = 2) private BigDecimal declaredValue;

    // -- money
    // money & payments
    @Column(length = 3) private String currency = "INR";
    @Column(name = "quoted_amount", precision = 12, scale = 2) private BigDecimal quotedAmount;
    @Column(name = "final_amount", precision = 12, scale = 2)  private BigDecimal finalAmount;
    @Column(name = "payment_method", length = 16) private String paymentMethod; // cod|wallet|card
    @Column(name = "payment_intent_id", length = 100) private String paymentIntentId;
    @Column(name = "promo_code", length = 64) private String promoCode;

    // -- assignment
    // assignment snapshot
    @Column(name = "courier_id") private Long courierId;
    @Column(name = "vehicle_plate", length = 20) private String vehiclePlate;
    @Column(name = "eta_minutes") private Integer etaMinutes;

    // -- timestamps
    // timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void touch() { this.updatedAt = LocalDateTime.now(); }

}
