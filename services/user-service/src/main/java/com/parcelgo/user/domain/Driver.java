package com.parcelgo.user.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
  name = "drivers",
  uniqueConstraints = {
    @UniqueConstraint(name = "uk_driver_email", columnNames = {"email"})
  }
)
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // basic
    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(length = 40)
    private String phone;

    // vehicle
    @Column(name = "vehicle_registration", length = 40)
    private String vehicleRegistration;

    @Column(name = "max_weight_kg")
    private Integer maxWeightKg;

    // start (garage)
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name="line1", column=@Column(name="start_line1")),
        @AttributeOverride(name="line2", column=@Column(name="start_line2")),
        @AttributeOverride(name="city", column=@Column(name="start_city")),
        @AttributeOverride(name="state", column=@Column(name="start_state")),
        @AttributeOverride(name="postalCode", column=@Column(name="start_postal")),
        @AttributeOverride(name="country", column=@Column(name="start_country")),
        @AttributeOverride(name="latitude", column=@Column(name="start_lat")),
        @AttributeOverride(name="longitude", column=@Column(name="start_lng"))
    })
    private AddressComponent startAddress = new AddressComponent();

    // end (return garage)
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name="line1", column=@Column(name="end_line1")),
        @AttributeOverride(name="line2", column=@Column(name="end_line2")),
        @AttributeOverride(name="city", column=@Column(name="end_city")),
        @AttributeOverride(name="state", column=@Column(name="end_state")),
        @AttributeOverride(name="postalCode", column=@Column(name="end_postal")),
        @AttributeOverride(name="country", column=@Column(name="end_country")),
        @AttributeOverride(name="latitude", column=@Column(name="end_lat")),
        @AttributeOverride(name="longitude", column=@Column(name="end_lng"))
    })
    private AddressComponent endAddress = new AddressComponent();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now; updatedAt = now;
    }
    @PreUpdate
    public void preUpdate() { updatedAt = Instant.now(); }

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getVehicleRegistration() { return vehicleRegistration; }
    public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }
    public Integer getMaxWeightKg() { return maxWeightKg; }
    public void setMaxWeightKg(Integer maxWeightKg) { this.maxWeightKg = maxWeightKg; }
    public AddressComponent getStartAddress() { return startAddress; }
    public void setStartAddress(AddressComponent startAddress) { this.startAddress = startAddress; }
    public AddressComponent getEndAddress() { return endAddress; }
    public void setEndAddress(AddressComponent endAddress) { this.endAddress = endAddress; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
