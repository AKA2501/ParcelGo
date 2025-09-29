package com.parcelgo.user.web;

import com.parcelgo.user.service.DriverService;
import com.parcelgo.user.web.dto.DriverCreateRequest;
import com.parcelgo.user.web.dto.DriverResponse;
import com.parcelgo.user.web.dto.DriverSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/drivers")
public class DriverController {

    private final DriverService driverService;
    public DriverController(DriverService driverService) { this.driverService = driverService; }

    @PostMapping
    public ResponseEntity<DriverResponse> create(@RequestBody @Valid DriverCreateRequest req) {
        System.out.println("Incoming DriverCreateRequest = " + req);

        DriverResponse created = driverService.create(req);
        return ResponseEntity.created(URI.create("/drivers/" + created.getId())).body(created);
    }

    @GetMapping
    public List<DriverSummaryResponse> list() {
        return driverService.list();
    }

    @GetMapping("/{id}")
    public DriverResponse get(@PathVariable Long id) {
        return driverService.get(id);
    }
}
