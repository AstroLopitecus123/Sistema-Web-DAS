package com.web.capas.application.decorator;

import com.web.capas.application.service.notificacion.NotificacionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


//decorator que añade un loggeo automatico a las notificaciones registra el inicio, éxito y errores de los envíos
public class LoggingNotificacionDecorator extends NotificacionDecorator {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingNotificacionDecorator.class);

    public LoggingNotificacionDecorator(NotificacionService notificacionDecorada) {
        super(notificacionDecorada);
    }

    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        logger.info("INICIANDO notificación para: {}", destinatario);
        logger.info("Mensaje: {}", mensaje);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Delegar al servicio original
            super.enviarNotificacion(destinatario, mensaje);
            
            long endTime = System.currentTimeMillis();
            logger.info("NOTIFICACIÓN EXITOSA para: {} ({}ms)", destinatario, (endTime - startTime));
            
        } catch (Exception e) {
            logger.error("ERROR enviando notificación a {}: {}", destinatario, e.getMessage());
            throw e; // Re-lanzar la excepción
        }
    }
}