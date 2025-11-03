package com.web.capas.application.service.notificacion;

import org.springframework.stereotype.Service;

@Service
public class SMSNotificacionService implements NotificacionService {
    
    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        // Lógica para enviar SMS (A futuro)
        System.out.println("Enviando SMS a: " + destinatario);
        System.out.println("Mensaje: " + mensaje);
    }
    
    @Override
    public boolean soportaTipo(String tipo) {
        return "SMS".equalsIgnoreCase(tipo);
    }
}