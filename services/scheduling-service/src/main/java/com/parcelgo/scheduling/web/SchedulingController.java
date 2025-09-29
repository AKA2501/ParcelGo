package com.parcelgo.scheduling.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping({"/scheduling","/slots","/assignments"})
public class SchedulingController {

  static class Slot {
    public String id;
    public String start;
    public String end;
    public int capacity;
    public int used;
  }

  private final Map<String, Slot> slots = new ConcurrentHashMap<>();

  @PostMapping("/slots")
  @ResponseStatus(HttpStatus.CREATED)
  public Slot createSlot(@RequestBody Slot s){
    s.id = UUID.randomUUID().toString();
    slots.put(s.id, s);
    return s;
  }

  @GetMapping("/slots")
  public Collection<Slot> list(){ return slots.values(); }

  @PostMapping("/assign")
  public Map<String, Object> assign(@RequestBody Map<String,Object> body){
    // naive: just echo assignment with ETA = now+30m
    return Map.of(
      "orderId", body.get("orderId"),
      "courierId", body.getOrDefault("courierId","tbd"),
      "eta", OffsetDateTime.now().plusMinutes(30).toString(),
      "type", body.getOrDefault("type", "on-demand")
    );
  }
}
