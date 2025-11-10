package com.web.capas.application.strategy;

import com.web.capas.application.factory.NotificacionType;

// Estrategia para armar el mensaje segun el canal.
public interface NotificacionContenidoStrategy {

    boolean soporta(NotificacionType tipo);

    String construirMensaje(String destinatario, String mensajeBase);
}

