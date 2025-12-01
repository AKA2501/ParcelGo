package com.parcelgo.user.web.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
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

}
