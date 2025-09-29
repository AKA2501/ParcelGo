package com.parcelgo.user.web.dto;

import java.util.List;

public class DriverResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String vehicleRegistration;
    private Integer maxWeightKg;

    private AddressDto startAddress;
    private AddressDto endAddress;

    private List<DayScheduleDto> schedule;

    // nested DTOs (simple POJOs)
    public static class AddressDto {
        public String line1, line2, city, state, postalCode, country;
        public Double latitude, longitude;
    }
    public static class DayScheduleDto {
        public int day;
        public boolean enabled;
        public String start; // HH:mm
        public String end;   // HH:mm
    }

    // getters/setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public String getVehicleRegistration() { return vehicleRegistration; } public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
    public Integer getMaxWeightKg() { return maxWeightKg; } public void setMaxWeightKg(Integer maxWeightKg) { this.maxWeightKg = maxWeightKg; }
    public AddressDto getStartAddress() { return startAddress; } public void setStartAddress(AddressDto startAddress) { this.startAddress = startAddress; }
    public AddressDto getEndAddress() { return endAddress; } public void setEndAddress(AddressDto endAddress) { this.endAddress = endAddress; }
    public List<DayScheduleDto> getSchedule() { return schedule; } public void setSchedule(List<DayScheduleDto> schedule) { this.schedule = schedule; }
}
