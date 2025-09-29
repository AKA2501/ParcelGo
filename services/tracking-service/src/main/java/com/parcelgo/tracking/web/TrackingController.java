package com.parcelgo.tracking.web;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TrackingController {
  private final SimpMessagingTemplate template;
  public TrackingController(SimpMessagingTemplate template){ this.template = template; }

  @MessageMapping("/locate")
  public void locate(Map<String,Object> msg){
    // expects { orderId, lat, lng }
    Object orderId = msg.get("orderId");
    template.convertAndSend("/topic/orders/" + orderId, msg);
  }
}
