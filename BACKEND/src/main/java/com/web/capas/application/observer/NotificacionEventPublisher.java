package com.web.capas.application.observer;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class NotificacionEventPublisher {

    private final ApplicationEventPublisher publisher;

    public NotificacionEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publicar(NotificacionEnviadaEvent evento) {
        publisher.publishEvent(evento);
    }
}

