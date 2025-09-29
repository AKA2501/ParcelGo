package com.parcelgo.payment.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/payments","/payment-intents"})
public class PaymentController {

  @PostMapping("/intents")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String,Object> createIntent(@RequestBody Map<String,Object> body){
    return Map.of(
      "intentId", UUID.randomUUID().toString(),
      "clientSecret", UUID.randomUUID().toString(),
      "amount", body.getOrDefault("amount", 0)
    );
  }
}
