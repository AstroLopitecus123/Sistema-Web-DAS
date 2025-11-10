package com.web.capas.application.strategy;

import com.web.capas.application.factory.NotificacionType;
import com.web.capas.application.singleton.NotificacionConfiguracion;
import org.springframework.stereotype.Component;

@Component
public class SmsContenidoStrategy implements NotificacionContenidoStrategy {

    private static final int MAX_LENGTH = 140;
    private final NotificacionConfiguracion configuracion = NotificacionConfiguracion.getInstance();

    @Override
    public boolean soporta(NotificacionType tipo) {
        return NotificacionType.SMS == tipo;
    }

    @Override
    public String construirMensaje(String destinatario, String mensajeBase) {
        String contenido = configuracion.getPrefijoAplicacion() + " " + mensajeBase;
        if (contenido.length() > MAX_LENGTH) {
            return contenido.substring(0, MAX_LENGTH - 3) + "...";
        }
        return contenido;
    }
}

