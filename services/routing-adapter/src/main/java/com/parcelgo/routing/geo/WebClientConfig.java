package com.parcelgo.routing.geo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean("nominatim")
    public WebClient nominatim() {
        // Nominatim requires a valid, descriptive UA string
        return WebClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "ParcelGo/1.0 (dev) contact: you@example.com")
                .build();
    }
}
