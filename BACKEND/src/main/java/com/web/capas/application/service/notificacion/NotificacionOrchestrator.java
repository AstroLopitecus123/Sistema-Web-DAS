package com.web.capas.application.service.notificacion;

import com.web.capas.application.factory.NotificacionFactory;
import com.web.capas.application.factory.NotificacionType;
import com.web.capas.application.observer.NotificacionEnviadaEvent;
import com.web.capas.application.observer.NotificacionEventPublisher;
import com.web.capas.application.strategy.NotificacionStrategyContext;
import org.springframework.stereotype.Service;

@Service
public class NotificacionOrchestrator {

    private final NotificacionFactory notificacionFactory;
    private final NotificacionStrategyContext strategyContext;
    private final NotificacionEventPublisher eventPublisher;

    public NotificacionOrchestrator(NotificacionFactory notificacionFactory,
                                    NotificacionStrategyContext strategyContext,
                                    NotificacionEventPublisher eventPublisher) {
        this.notificacionFactory = notificacionFactory;
        this.strategyContext = strategyContext;
        this.eventPublisher = eventPublisher;
    }

    public void enviar(NotificacionType tipo, String destinatario, String mensajeBase) {
        String mensajeFormateado = strategyContext.construirMensaje(tipo, destinatario, mensajeBase);
        NotificacionService servicio = notificacionFactory.crearNotificacion(tipo);
        servicio.enviarNotificacion(destinatario, mensajeFormateado);
        eventPublisher.publicar(new NotificacionEnviadaEvent(tipo, destinatario, mensajeFormateado));
    }
}

