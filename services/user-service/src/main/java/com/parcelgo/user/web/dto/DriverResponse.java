package com.parcelgo.user.web.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class DriverResponse {

    // getters/setters
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String vehicleRegistration;
    private Integer maxWeightKg;

    private AddressDto startAddress;
    private AddressDto endAddress;

    private DayScheduleDto schedule;

    // nested DTOs (simple POJOs)
    public static class AddressDto {
        public String addressLine1, addressLine2, city, state, postalCode, country;
        public Double lat, lng;
    }
    public static class DayScheduleDto {
        public String day;
        public String start; // HH:mm
        public String end;   // HH:mm
    }

}
