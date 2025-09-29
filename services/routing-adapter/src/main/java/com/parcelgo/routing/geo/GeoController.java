package com.parcelgo.routing.geo;

import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/geo")
// ⚠️ Do NOT put @CrossOrigin here while the gateway also sets CORS headers,
// otherwise you’ll get “Access-Control-Allow-Origin header contains multiple values”.
public class GeoController {

    private final WebClient nominatim;

    public GeoController(@Qualifier("nominatim") WebClient nominatim) {
        this.nominatim = nominatim;
    }

    /** Forward geocoding / search (autocomplete). */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<Map<String, Object>> search(
            @RequestParam("q") String q,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {

        return nominatim.get()
                .uri(uri -> uri.path("/search")
                        .queryParam("format", "jsonv2")
                        .queryParam("addressdetails", "1")
                        .queryParam("limit", limit)
                        .queryParam("q", q)
                        .build())
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    /** Reverse geocoding (lat/lon -> address & display_name). */
    @GetMapping(value = "/reverse", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<Map<String, Object>> reverse(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon) {

        return nominatim.get()
                .uri(uri -> uri.path("/reverse")
                        .queryParam("format", "jsonv2")
                        .queryParam("addressdetails", "1")
                        .queryParam("lat", lat)
                        .queryParam("lon", lon)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }
}
