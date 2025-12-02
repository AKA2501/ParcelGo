package com.parcelgo.user.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class DriverCreateRequest {

    // getters/setters
    @NotBlank @Size(max = 120)
    private String name;

    @NotBlank @Email @Size(max = 200)
    private String email;

    @Size(max = 40)
    private String phone;

    @Size(max = 40)
    private String vehicleRegistration;

    @Min(0)
    private Integer maxWeightKg;

    @NotNull @Valid
    private AddressDto startAddress;

    @NotNull @Valid
    private AddressDto endAddress;

    @NotNull @Size(min = 1, max = 7)
    @Valid
    private DayScheduleDto schedule;

    // nested DTOs
    @Setter
    @Getter
    public static class AddressDto {
        @Size(max = 120) private String addressLine1;
        @Size(max = 120) private String addressLine2;
        @Size(max = 80) private String city;
        @Size(max = 80) private String state;
        @Size(max = 20) private String postalCode;
        @Size(max = 80) private String country;
        @DecimalMin(value = "-90.0", inclusive = true, message = "latitude must be >= -90") @DecimalMax(value = "90.0", inclusive = true, message = "latitude must be <= 90")
        private Double lat;
        @DecimalMin(value = "-180.0", inclusive = true, message = "longitude must be >= -180") @DecimalMax(value = "180.0", inclusive = true, message = "longitude must be <= 180")
        private Double lng;

    }

    @Setter
    @Getter
    public static class DayScheduleDto {
        @Min(0) @Max(6) private String day;
        // "HH:mm"
        @Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message="start must be HH:mm")
        private String start;
        @Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message="end must be HH:mm")
        private String end;

    }

}
