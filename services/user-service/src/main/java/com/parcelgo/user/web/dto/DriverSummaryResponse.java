package com.parcelgo.user.web.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DriverSummaryResponse {
    // getters/setters
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String vehicleRegistration;
    private Integer maxWeightKg;
    private String startCity;
    private String endCity;
}
