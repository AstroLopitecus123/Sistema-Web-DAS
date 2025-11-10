package com.web.capas.application.observer;

import com.web.capas.application.factory.NotificacionType;

public class NotificacionEnviadaEvent {

    private final NotificacionType tipo;
    private final String destinatario;
    private final String contenido;

    public NotificacionEnviadaEvent(NotificacionType tipo, String destinatario, String contenido) {
        this.tipo = tipo;
        this.destinatario = destinatario;
        this.contenido = contenido;
    }

    public NotificacionType getTipo() {
        return tipo;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public String getContenido() {
        return contenido;
    }
}

