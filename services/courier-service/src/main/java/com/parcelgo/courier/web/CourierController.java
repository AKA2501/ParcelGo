package com.parcelgo.courier.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/couriers")
public class CourierController {

  @GetMapping("/nearby")
  public List<Map<String,Object>> nearby(@RequestParam double lat, @RequestParam double lng){
    return List.of(
      Map.of("id", 1, "vehicle", "bike", "lat", lat+0.001, "lng", lng+0.001),
      Map.of("id", 2, "vehicle", "car", "lat", lat-0.001, "lng", lng-0.001)
    );
  }
}
