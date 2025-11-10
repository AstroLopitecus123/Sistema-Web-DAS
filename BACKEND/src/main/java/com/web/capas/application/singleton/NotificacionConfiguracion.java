package com.web.capas.application.singleton;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

// Configuración compartida para notificaciones.
public final class NotificacionConfiguracion {

    private static final NotificacionConfiguracion INSTANCE = new NotificacionConfiguracion();

    private volatile String prefijoAplicacion = "[TIENDA-ONLINE]";
    private final AtomicInteger maximoReintentos = new AtomicInteger(3);
    private volatile Duration tiempoEsperaEntreReintentos = Duration.ofSeconds(3);

    private NotificacionConfiguracion() {
    }

    public static NotificacionConfiguracion getInstance() {
        return INSTANCE;
    }

    public String getPrefijoAplicacion() {
        return prefijoAplicacion;
    }

    public void actualizarPrefijoAplicacion(String nuevoPrefijo) {
        if (nuevoPrefijo != null && !nuevoPrefijo.trim().isEmpty()) {
            this.prefijoAplicacion = nuevoPrefijo.trim();
        }
    }

    public int getMaximoReintentos() {
        return maximoReintentos.get();
    }

    public void actualizarMaximoReintentos(int maximo) {
        if (maximo > 0) {
            maximoReintentos.set(maximo);
        }
    }

    public Duration getTiempoEsperaEntreReintentos() {
        return tiempoEsperaEntreReintentos;
    }

    public void actualizarTiempoEsperaEntreReintentos(Duration duracion) {
        if (duracion != null && !duracion.isNegative() && !duracion.isZero()) {
            this.tiempoEsperaEntreReintentos = duracion;
        }
    }
}

