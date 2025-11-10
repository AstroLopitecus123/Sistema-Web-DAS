package com.web.capas.application.strategy;

import com.web.capas.application.factory.NotificacionType;
import com.web.capas.domain.ServiceException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

// Selecciona la estrategia correcta para cada tipo.
@Component
public class NotificacionStrategyContext {

    private final Map<NotificacionType, NotificacionContenidoStrategy> estrategias = new ConcurrentHashMap<>();

    public NotificacionStrategyContext(List<NotificacionContenidoStrategy> estrategiasDisponibles) {
        estrategiasDisponibles.forEach(estrategia -> {
            for (NotificacionType tipo : NotificacionType.values()) {
                if (estrategia.soporta(tipo)) {
                    estrategias.put(tipo, estrategia);
                }
            }
        });
    }

    public String construirMensaje(NotificacionType tipo, String destinatario, String mensajeBase) {
        NotificacionContenidoStrategy estrategia = estrategias.get(tipo);
        if (estrategia == null) {
            throw new ServiceException("No existe estrategia para el tipo de notificación: " + tipo);
        }
        return estrategia.construirMensaje(destinatario, mensajeBase);
    }
}

