package com.parcelgo.user.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public class DriverCreateRequest {

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
    private List<DayScheduleDto> schedule;

    // nested DTOs
    public static class AddressDto {
        @Size(max = 120) private String line1;
        @Size(max = 120) private String line2;
        @Size(max = 80) private String city;
        @Size(max = 80) private String state;
        @Size(max = 20) private String postalCode;
        @Size(max = 80) private String country;
        @DecimalMin(value = "-90.0", inclusive = true, message = "latitude must be >= -90") @DecimalMax(value = "90.0", inclusive = true, message = "latitude must be <= 90")
        private Double latitude;
        @DecimalMin(value = "-180.0", inclusive = true, message = "longitude must be >= -180") @DecimalMax(value = "180.0", inclusive = true, message = "longitude must be <= 180")
        private Double longitude;

        public String getLine1() { return line1; } public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; } public void setLine2(String line2) { this.line2 = line2; }
        public String getCity() { return city; } public void setCity(String city) { this.city = city; }
        public String getState() { return state; } public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; } public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; } public void setCountry(String country) { this.country = country; }
        public Double getLatitude() { return latitude; } public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; } public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class DayScheduleDto {
        @Min(0) @Max(6) private int day;
        private boolean enabled;
        // "HH:mm"
        @Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message="start must be HH:mm")
        private String start;
        @Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message="end must be HH:mm")
        private String end;

        public int getDay() { return day; } public void setDay(int day) { this.day = day; }
        public boolean isEnabled() { return enabled; } public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getStart() { return start; } public void setStart(String start) { this.start = start; }
        public String getEnd() { return end; } public void setEnd(String end) { this.end = end; }
    }

    // getters/setters
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public String getVehicleRegistration() { return vehicleRegistration; } public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
    public Integer getMaxWeightKg() { return maxWeightKg; } public void setMaxWeightKg(Integer maxWeightKg) { this.maxWeightKg = maxWeightKg; }
    public AddressDto getStartAddress() { return startAddress; } public void setStartAddress(AddressDto startAddress) { this.startAddress = startAddress; }
    public AddressDto getEndAddress() { return endAddress; } public void setEndAddress(AddressDto endAddress) { this.endAddress = endAddress; }
    public List<DayScheduleDto> getSchedule() { return schedule; } public void setSchedule(List<DayScheduleDto> schedule) { this.schedule = schedule; }
}
