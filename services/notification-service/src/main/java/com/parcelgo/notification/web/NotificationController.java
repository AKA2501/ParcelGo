package com.parcelgo.notification.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/notify","/notifications"})
public class NotificationController {
  private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

  @PostMapping
  @ResponseStatus(HttpStatus.ACCEPTED)
  public Map<String,Object> notify(@RequestBody Map<String,Object> body){
    log.info("Notification: {}", body);
    return Map.of("status", "queued");
  }
}
