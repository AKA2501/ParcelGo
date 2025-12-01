package com.parcelgo.user.domain;

import jakarta.persistence.*;
import jdk.jfr.DataAmount;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(
  name = "drivers",
  uniqueConstraints = {
    @UniqueConstraint(name = "uk_driver_email", columnNames = {"email"})
  }
)
@Data
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
        @AttributeOverride(name="addressLine1", column=@Column(name="start_line1")),
        @AttributeOverride(name="addressLine2", column=@Column(name="start_line2")),
        @AttributeOverride(name="city", column=@Column(name="start_city")),
        @AttributeOverride(name="state", column=@Column(name="start_state")),
        @AttributeOverride(name="postalCode", column=@Column(name="start_postal")),
        @AttributeOverride(name="country", column=@Column(name="start_country")),
        @AttributeOverride(name="lat", column=@Column(name="start_lat")),
        @AttributeOverride(name="lng", column=@Column(name="start_lng"))
    })
    private AddressComponent startAddress = new AddressComponent();

    // end (return garage)
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name="addressLine1", column=@Column(name="end_line1")),
        @AttributeOverride(name="addressLine2", column=@Column(name="end_line2")),
        @AttributeOverride(name="city", column=@Column(name="end_city")),
        @AttributeOverride(name="state", column=@Column(name="end_state")),
        @AttributeOverride(name="postalCode", column=@Column(name="end_postal")),
        @AttributeOverride(name="country", column=@Column(name="end_country")),
        @AttributeOverride(name="lat", column=@Column(name="end_lat")),
        @AttributeOverride(name="lng", column=@Column(name="end_lng"))
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
}
