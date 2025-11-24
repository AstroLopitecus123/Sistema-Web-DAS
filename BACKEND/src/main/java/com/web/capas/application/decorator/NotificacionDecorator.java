package com.web.capas.application.decorator;

import com.web.capas.application.service.notificacion.NotificacionService;

public abstract class NotificacionDecorator implements NotificacionService {
    
    protected NotificacionService notificacionDecorada;

    public NotificacionDecorator(NotificacionService notificacionDecorada) {
        this.notificacionDecorada = notificacionDecorada;
    }

    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        notificacionDecorada.enviarNotificacion(destinatario, mensaje);
    }

    @Override
    public boolean soportaTipo(String tipo) {
        return notificacionDecorada.soportaTipo(tipo);
    }
}