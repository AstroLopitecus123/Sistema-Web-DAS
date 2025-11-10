package com.web.capas.application.strategy;

import com.web.capas.application.factory.NotificacionType;
import com.web.capas.application.singleton.NotificacionConfiguracion;
import org.springframework.stereotype.Component;

@Component
public class EmailContenidoStrategy implements NotificacionContenidoStrategy {

    private final NotificacionConfiguracion configuracion = NotificacionConfiguracion.getInstance();

    @Override
    public boolean soporta(NotificacionType tipo) {
        return NotificacionType.EMAIL == tipo;
    }

    @Override
    public String construirMensaje(String destinatario, String mensajeBase) {
        return configuracion.getPrefijoAplicacion() + " Estimado/a " + destinatario + ",\n\n" + mensajeBase + "\n\nSaludos cordiales.";
    }
}

