package com.web.capas.application.decorator;

import com.web.capas.application.service.notificacion.NotificacionService;
import java.util.concurrent.atomic.AtomicInteger;

public class MetricasNotificacionDecorator extends NotificacionDecorator {
    
    private final AtomicInteger totalNotificaciones = new AtomicInteger(0);
    private final AtomicInteger notificacionesExitosas = new AtomicInteger(0);
    private final AtomicInteger notificacionesFallidas = new AtomicInteger(0);

    public MetricasNotificacionDecorator(NotificacionService notificacionDecorada) {
        super(notificacionDecorada);
    }

    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        totalNotificaciones.incrementAndGet();
        long startTime = System.currentTimeMillis();
        
        try {
            // Delegar al servicio original
            super.enviarNotificacion(destinatario, mensaje);
            
            notificacionesExitosas.incrementAndGet();
            long endTime = System.currentTimeMillis();
            long tiempoEjecucion = endTime - startTime;
            
            // Log de métricas (en producción esto iría a un sistema de monitoreo)
            System.out.println("MÉTRICAS - Notificación exitosa:");
            System.out.println("   Tipo: " + (this.soportaTipo("WHATSAPP") ? "WHATSAPP" : "EMAIL"));
            System.out.println("   Tiempo: " + tiempoEjecucion + "ms");
            System.out.println("   Total enviadas: " + totalNotificaciones.get());
            System.out.println("   Éxito: " + notificacionesExitosas.get());
            System.out.println("   Fallidas: " + notificacionesFallidas.get());
            
        } catch (Exception e) {
            notificacionesFallidas.incrementAndGet();
            System.err.println("MÉTRICAS - Notificación fallida: " + e.getMessage());
            throw e;
        }
    }

    // Métodos para obtener métricas
    public int getTotalNotificaciones() {
        return totalNotificaciones.get();
    }
    
    public int getNotificacionesExitosas() {
        return notificacionesExitosas.get();
    }
    
    public int getNotificacionesFallidas() {
        return notificacionesFallidas.get();
    }
    
    public double getTasaExito() {
        int total = totalNotificaciones.get();
        return total > 0 ? (notificacionesExitosas.get() * 100.0) / total : 0.0;
    }
}