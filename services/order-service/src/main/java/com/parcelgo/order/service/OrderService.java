package com.parcelgo.order.service;

import com.parcelgo.order.domain.Order;
import com.parcelgo.order.repo.OrderRepository;
import com.parcelgo.order.web.dto.CreateOrderRequest;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Data
public class OrderService {

    private final OrderRepository orderRepo;

    @Transactional
    public Order create(@Valid @RequestBody CreateOrderRequest req) {
        Order o = new Order();
        o.setUserId(req.userId);
        o.setStatus("CREATED");

        if (req.fulfillment != null) {
            if (req.fulfillment.mode != null) o.setMode(req.fulfillment.mode);
            o.setScheduledAt(req.fulfillment.scheduledAt);
            o.setVehicleType(req.fulfillment.vehicleType);
        }
        if (req.pickup != null) {
            o.setPickupName(req.pickup.name);
            o.setPickupPhone(req.pickup.phone);
            o.setPickupAddr1(req.pickup.addr1);
            o.setPickupAddr2(req.pickup.addr2);
            o.setPickupCity(req.pickup.city);
            o.setPickupState(req.pickup.state);
            o.setPickupPostal(req.pickup.postal);
            o.setPickupLat(req.pickup.lat);
            o.setPickupLng(req.pickup.lng);
        }
        if (req.dropoff != null) {
            o.setDropName(req.dropoff.name);
            o.setDropPhone(req.dropoff.phone);
            o.setDropAddr1(req.dropoff.addr1);
            o.setDropAddr2(req.dropoff.addr2);
            o.setDropCity(req.dropoff.city);
            o.setDropState(req.dropoff.state);
            o.setDropPostal(req.dropoff.postal);
            o.setDropLat(req.dropoff.lat);
            o.setDropLng(req.dropoff.lng);
        }
        if (req.pkg != null) {
            o.setPackageDescription(req.pkg.description);
            o.setWeightKg(n(req.pkg.weightKg));
            if (req.pkg.dimensionsCm != null) {
                o.setLengthCm(n(req.pkg.dimensionsCm.length));
                o.setWidthCm(n(req.pkg.dimensionsCm.width));
                o.setHeightCm(n(req.pkg.dimensionsCm.height));
            }
            o.setDeclaredValue(n(req.pkg.declaredValue));
        }
        o.setPaymentMethod(req.paymentMethod);
        o.setPromoCode(req.promoCode);

        return orderRepo.save(o);
    }

    // ---------- LIST (with optional userId) ----------
    @Transactional
    public Page<Order> getOrders(Long userId, int page, int size) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }

        Pageable pageable = PageRequest.of(page, size);
        return orderRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }


    // ---------- GET ONE ----------//
    @Transactional
    public Optional<Order> getOrdersByID(Long id) {
        return orderRepo.findById(id);
    }


    private BigDecimal n(BigDecimal v){ return v; }
}
