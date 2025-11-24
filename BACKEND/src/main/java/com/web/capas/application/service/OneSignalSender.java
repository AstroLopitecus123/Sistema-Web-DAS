package com.web.capas.application.service;

import com.web.capas.infrastructure.config.OneSignalConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OneSignalSender {
    
    private static final String ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";
    
    @Autowired
    private OneSignalConfig oneSignalConfig;
    
    private final RestTemplate restTemplate;
    
    public OneSignalSender() {
        this.restTemplate = new RestTemplate();
    }
    
    public boolean enviarNotificacion(List<String> playerIds, String titulo, String mensaje, Map<String, Object> datos) {
        if (playerIds == null || playerIds.isEmpty()) {
            return false;
        }
        
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("app_id", oneSignalConfig.getAppId());
            body.put("include_player_ids", playerIds);
            body.put("headings", Map.of("en", titulo, "es", titulo));
            body.put("contents", Map.of("en", mensaje, "es", mensaje));
            
            if (datos != null && !datos.isEmpty()) {
                body.put("data", datos);
            }
            
            body.put("url", "http://localhost:4200/repartidor/dashboard");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + oneSignalConfig.getRestApiKey());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                ONESIGNAL_API_URL,
                HttpMethod.POST,
                request,
                new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            System.err.println("Error al enviar notificación push: " + e.getMessage());
            return false;
        }
    }
    
    public boolean enviarNotificacion(String playerId, String titulo, String mensaje, Map<String, Object> datos) {
        return enviarNotificacion(Collections.singletonList(playerId), titulo, mensaje, datos);
    }
}

