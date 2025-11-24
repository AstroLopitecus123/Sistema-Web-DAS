package com.web.capas.application.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RegistroAuditoriaNotificacionListener {

    private static final Logger logger = LoggerFactory.getLogger(RegistroAuditoriaNotificacionListener.class);

    @EventListener
    public void registrarAuditoria(NotificacionEnviadaEvent evento) {
        logger.info("AUDITORIA - Notificación {} enviada a {}. Contenido: {}",
                evento.getTipo(), evento.getDestinatario(), evento.getContenido());
    }
}

