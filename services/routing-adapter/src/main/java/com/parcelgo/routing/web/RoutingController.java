package com.parcelgo.routing.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping({"/routing","/eta"})
public class RoutingController {

  @GetMapping("/eta")
  public Map<String,Object> eta(@RequestParam double fromLat, @RequestParam double fromLng,
                                @RequestParam double toLat, @RequestParam double toLng){
    double R = 6371.0;
    double dLat = Math.toRadians(toLat - fromLat);
    double dLon = Math.toRadians(toLng - fromLng);
    double a = Math.sin(dLat/2)*Math.sin(dLat/2) +
               Math.cos(Math.toRadians(fromLat))*Math.cos(Math.toRadians(toLat)) *
               Math.sin(dLon/2)*Math.sin(dLon/2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    double km = R * c;
    double avgKmh = 30.0;
    double minutes = (km / avgKmh) * 60.0;
    return Map.of("distanceKm", km, "etaMinutes", minutes);
  }
}
