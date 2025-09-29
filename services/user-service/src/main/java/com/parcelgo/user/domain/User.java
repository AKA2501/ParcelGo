package com.parcelgo.user.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "users", indexes = {
  @Index(name = "idx_users_email", columnList = "email", unique = true),
  @Index(name = "idx_users_phone", columnList = "phone", unique = true),
  @Index(name = "idx_users_city", columnList = "city")
})
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

  // Getters & setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getAddressLine1() { return addressLine1; }
  public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
  public String getAddressLine2() { return addressLine2; }
  public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
  public String getCity() { return city; }
  public void setCity(String city) { this.city = city; }
  public String getState() { return state; }
  public void setState(String state) { this.state = state; }
  public String getPostalCode() { return postalCode; }
  public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
  public String getCountry() { return country; }
  public void setCountry(String country) { this.country = country; }
  public BigDecimal getHomeLat() { return homeLat; }
  public void setHomeLat(BigDecimal homeLat) { this.homeLat = homeLat; }
  public BigDecimal getHomeLng() { return homeLng; }
  public void setHomeLng(BigDecimal homeLng) { this.homeLng = homeLng; }
  public String getDefaultPaymentMethod() { return defaultPaymentMethod; }
  public void setDefaultPaymentMethod(String defaultPaymentMethod) { this.defaultPaymentMethod = defaultPaymentMethod; }
  public BigDecimal getWalletBalance() { return walletBalance; }
  public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }
  public boolean isKycVerified() { return kycVerified; }
  public void setKycVerified(boolean kycVerified) { this.kycVerified = kycVerified; }
  public String getKycDocKey() { return kycDocKey; }
  public void setKycDocKey(String kycDocKey) { this.kycDocKey = kycDocKey; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}