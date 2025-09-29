package com.parcelgo.order.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CreateOrderRequest {
    public Long userId;

    public static class Fulfillment {
        public String mode;              // ON_DEMAND|SCHEDULED
        public LocalDateTime scheduledAt;
        public String vehicleType;
    }
    public Fulfillment fulfillment;

    public static class Address {
        public String name;
        public String phone;
        public String addr1;
        public String addr2;
        public String city;
        public String state;
        public String postal;
        public BigDecimal lat;
        public BigDecimal lng;
    }
    public Address pickup;
    public Address dropoff;

    public static class DimensionsCm {
        public BigDecimal length;
        public BigDecimal width;
        public BigDecimal height;
    }
    public static class Pkg {
        public String description;
        public BigDecimal weightKg;
        public DimensionsCm dimensionsCm;
        public BigDecimal declaredValue;
    }
    public Pkg pkg;

    public String paymentMethod; // cod|wallet|card
    public String promoCode;
}
