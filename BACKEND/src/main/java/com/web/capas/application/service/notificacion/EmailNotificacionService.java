package com.web.capas.application.service.notificacion;

import org.springframework.stereotype.Service;

@Service
public class EmailNotificacionService implements NotificacionService {
    
    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        // Lógica específica para enviar email
        System.out.println("Enviando EMAIL a: " + destinatario);
        System.out.println("Mensaje: " + mensaje);
        //Integrar con emaillmpl (Ya que de momento solo sirve para enviar el correo pa recuperar la contraseña)
    }
    
    @Override
    public boolean soportaTipo(String tipo) {
        return "EMAIL".equalsIgnoreCase(tipo);
    }
}