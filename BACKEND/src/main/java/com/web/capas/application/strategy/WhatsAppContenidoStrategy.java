package com.web.capas.application.strategy;

import com.web.capas.application.factory.NotificacionType;
import com.web.capas.application.singleton.NotificacionConfiguracion;
import org.springframework.stereotype.Component;

@Component
public class WhatsAppContenidoStrategy implements NotificacionContenidoStrategy {

    private final NotificacionConfiguracion configuracion = NotificacionConfiguracion.getInstance();

    @Override
    public boolean soporta(NotificacionType tipo) {
        return NotificacionType.WHATSAPP == tipo;
    }

    @Override
    public String construirMensaje(String destinatario, String mensajeBase) {
        return String.format("%s 👋 Hola %s!\n%s", configuracion.getPrefijoAplicacion(), destinatario, mensajeBase);
    }
}

