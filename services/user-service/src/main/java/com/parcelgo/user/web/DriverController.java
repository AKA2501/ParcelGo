package com.parcelgo.user.web;

import com.parcelgo.user.service.DriverService;
import com.parcelgo.user.web.dto.DriverCreateRequest;
import com.parcelgo.user.web.dto.DriverResponse;
import com.parcelgo.user.web.dto.DriverSummaryResponse;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/drivers")
@Data
public class DriverController {

    private final DriverService driverService;
   private final com.fasterxml.jackson.databind.ObjectMapper om; // Jackson

    @PostMapping
    public ResponseEntity<DriverResponse> create(@RequestBody @Valid DriverCreateRequest req) {
   
      try {
        System.out.println("MARKER-A reached");
      System.out.println("Incoming DriverCreateRequest33 = " +
        om.writerWithDefaultPrettyPrinter().writeValueAsString(req));
    } catch (Exception e) {
      e.printStackTrace(); // don't swallow silently while debugging
    }

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
