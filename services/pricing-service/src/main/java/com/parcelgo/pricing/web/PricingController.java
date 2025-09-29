package com.parcelgo.pricing.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/pricing","/quotes"})
public class PricingController {

  @GetMapping("/quote")
  public Map<String, Object> quote(@RequestParam double distanceKm,
                                   @RequestParam double weightKg) {
    double base = 30.0;
    double perKm = 10.0;
    double perKg = 5.0;
    double total = base + distanceKm * perKm + weightKg * perKg;
    return Map.of("currency", "INR", "amount", total, "distanceKm", distanceKm, "weightKg", weightKg);
  }
}
