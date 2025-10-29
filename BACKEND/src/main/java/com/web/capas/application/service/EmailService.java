package com.web.capas.application.service;

public interface EmailService {
    
    // Envía correo de recuperación de contraseña
    void enviarCorreoRecuperacion(String emailDestino, String token, String nombreUsuario);
}
