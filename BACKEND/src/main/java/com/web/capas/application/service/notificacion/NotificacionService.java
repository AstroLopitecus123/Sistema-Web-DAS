package com.web.capas.application.service.notificacion;

public interface NotificacionService {
    void enviarNotificacion(String destinatario, String mensaje);
    boolean soportaTipo(String tipo);

}
