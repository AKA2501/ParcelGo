package com.parcelgo.user.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Data;

@Entity
@Table(name = "users", indexes = {
  @Index(name = "idx_users_email", columnList = "email", unique = true),
  @Index(name = "idx_users_phone", columnList = "phone", unique = true),
  @Index(name = "idx_users_city", columnList = "city")
})
@Data
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank @Size(max = 100)
  private String name;

  @NotBlank @Email @Size(max = 200)
  @Column(nullable = false, unique = true, length = 200)
  private String email;

  @Size(max = 20)
  @Column(unique = true, length = 20)
  private String phone; // E.164 recommended (e.g. +919999999999)

  // Address (home)
  @Size(max = 120)
  private String addressLine1;
  @Size(max = 120)
  private String addressLine2;
  @Size(max = 80)
  private String city;
  @Size(max = 80)
  private String state;
  @Size(max = 20)
  private String postalCode;
  @Size(max = 80)
  private String country;

  // Geocoded lat/lng for the home address (to be filled by routing-adapter later)
  @Column(precision = 9, scale = 6)
  private BigDecimal homeLat;   // e.g., 28.6139
  @Column(precision = 9, scale = 6)
  private BigDecimal homeLng;   // e.g., 77.2090

  // Payments & compliance
  @Size(max = 50)
  private String defaultPaymentMethod; // e.g., "card", "cod", "wallet"

  @Column(precision = 12, scale = 2)
  private BigDecimal walletBalance = BigDecimal.ZERO;

  private boolean kycVerified = false;

  @Size(max = 255)
  private String kycDocKey; // S3/MinIO object key for KYC document

  // Auditing
  @Column(nullable = false)
  private Instant createdAt;
  @Column(nullable = false)
  private Instant updatedAt;

  @PrePersist
  public void onCreate(){
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }
  @PreUpdate
  public void onUpdate(){ this.updatedAt = Instant.now(); }
}