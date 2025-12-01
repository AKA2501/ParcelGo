package com.parcelgo.order.web;

import com.parcelgo.order.domain.Order;
import com.parcelgo.order.service.OrderService;
import com.parcelgo.order.web.dto.CreateOrderRequest;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@Data
public class OrderController {

    @Autowired
    private final OrderService orderService;

    // ---------- CREATE ----------
    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody CreateOrderRequest req) {
        Order created = orderService.create(req);
        return ResponseEntity
                .created(URI.create("/orders/" + created.getId()))
                .body(created);
    }

    // ---------- LIST (with optional userId) ----------
    @GetMapping
    public Page<Order> getOrdersByID(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        return orderService.getOrders(userId,page,size);
    }

    // ---------- GET ONE ----------
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOne(@PathVariable("id") Long id) {
        Optional<Order> maybe = orderService.getOrdersByID(id);
        return maybe.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }
}