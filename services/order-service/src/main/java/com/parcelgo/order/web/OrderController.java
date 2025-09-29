package com.parcelgo.order.web;

import com.parcelgo.order.domain.Order;
import com.parcelgo.order.repo.OrderRepository;
import com.parcelgo.order.web.dto.CreateOrderRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository repo;
    public OrderController(OrderRepository repo){ this.repo = repo; }

    // ---------- CREATE ----------
    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody CreateOrderRequest req) {
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

        Order saved = repo.save(o);
        return ResponseEntity
                .created(URI.create("/orders/" + saved.getId()))
                .body(saved);
    }

    // ---------- LIST (with optional userId) ----------
    @GetMapping
    public Page<Order> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return (userId != null)
                ? repo.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                : repo.findAllByOrderByCreatedAtDesc(pageable);
    }

    // ---------- GET ONE ----------
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOne(@PathVariable Long id) {
        Optional<Order> maybe = repo.findById(id);
        return maybe.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private BigDecimal n(BigDecimal v){ return v == null ? null : v; }
}
