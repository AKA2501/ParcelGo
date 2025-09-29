package com.parcelgo.user.web.dto;

import jakarta.validation.constraints.*;

public class UserCreateRequest {
  @NotBlank @Size(max = 100)
  private String name;

  @NotBlank @Email @Size(max = 200)
  private String email;

  @Size(max = 20)                 // Suggest E.164, e.g., +919999999999
  private String phone;

  @Size(max = 120) private String addressLine1;
  @Size(max = 120) private String addressLine2;
  @Size(max = 80)  private String city;
  @Size(max = 80)  private String state;
  @Size(max = 20)  private String postalCode;
  @Size(max = 80)  private String country;

  private Double homeLat; // optional (geocode later)
  private Double homeLng;

  @Size(max = 50) private String defaultPaymentMethod; // optional
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
  public Double getHomeLat() { return homeLat; }
  public void setHomeLat(Double homeLat) { this.homeLat = homeLat; }
  public Double getHomeLng() { return homeLng; }
  public void setHomeLng(Double homeLng) { this.homeLng = homeLng; }
  public String getDefaultPaymentMethod() { return defaultPaymentMethod; }
  public void setDefaultPaymentMethod(String defaultPaymentMethod) { this.defaultPaymentMethod = defaultPaymentMethod; }
}
