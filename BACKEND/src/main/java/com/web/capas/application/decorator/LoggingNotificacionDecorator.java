package com.web.capas.application.decorator;

import com.web.capas.application.service.notificacion.NotificacionService;
import com.web.capas.application.singleton.NotificacionConfiguracion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
public class LoggingNotificacionDecorator extends NotificacionDecorator {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingNotificacionDecorator.class);

    public LoggingNotificacionDecorator(NotificacionService notificacionDecorada) {
        super(notificacionDecorada);
    }

    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        String prefijo = NotificacionConfiguracion.getInstance().getPrefijoAplicacion();

        logger.info("{} INICIANDO notificación para: {}", prefijo, destinatario);
        logger.info("Mensaje: {}", mensaje);
        
        long startTime = System.currentTimeMillis();
        
        try {
            super.enviarNotificacion(destinatario, mensaje);
            
            long endTime = System.currentTimeMillis();
            logger.info("{} NOTIFICACIÓN EXITOSA para: {} ({}ms)", prefijo, destinatario, (endTime - startTime));
            
        } catch (Exception e) {
            logger.error("{} ERROR enviando notificación a {}: {}", prefijo, destinatario, e.getMessage());
            throw e;
        }
    }
}