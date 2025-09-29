package com.parcelgo.user.web.dto;

public class DriverSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String vehicleRegistration;
    private Integer maxWeightKg;
    private String startCity;
    private String endCity;

    // getters/setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public String getVehicleRegistration() { return vehicleRegistration; } public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
    public Integer getMaxWeightKg() { return maxWeightKg; } public void setMaxWeightKg(Integer maxWeightKg) { this.maxWeightKg = maxWeightKg; }
    public String getStartCity() { return startCity; } public void setStartCity(String startCity) { this.startCity = startCity; }
    public String getEndCity() { return endCity; } public void setEndCity(String endCity) { this.endCity = endCity; }
}
