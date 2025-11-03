package com.web.capas.application.decorator;

import com.web.capas.application.service.notificacion.NotificacionService;
import com.web.capas.domain.ServiceException;


//valida los datos antes de enviar la notificación, asegura que el destinatario y mensaje cumplan con los requisitos.


public class ValidacionNotificacionDecorator extends NotificacionDecorator {

    public ValidacionNotificacionDecorator(NotificacionService notificacionDecorada) {
        super(notificacionDecorada);
    }

    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        // Validar destinatario
        if (destinatario == null || destinatario.trim().isEmpty()) {
            throw new ServiceException("El destinatario no puede estar vacío");
        }

        // Validar mensaje
        if (mensaje == null || mensaje.trim().isEmpty()) {
            throw new ServiceException("El mensaje no puede estar vacío");
        }

        // Validaciones específicas por tipo
        if (this.soportaTipo("WHATSAPP")) {
            validarWhatsApp(destinatario);
        } else if (this.soportaTipo("EMAIL")) {
            validarEmail(destinatario);
        }

        // Si pasa todas las validaciones, delegar al servicio original
        super.enviarNotificacion(destinatario, mensaje);
    }

    private void validarWhatsApp(String telefono) {
        if (!telefono.startsWith("+")) {
            throw new ServiceException("El número de WhatsApp debe incluir código de país (+51...)");
        }
        if (telefono.length() < 10) {
            throw new ServiceException("El número de WhatsApp parece inválido");
        }
    }

    private void validarEmail(String email) {
        if (!email.contains("@") || !email.contains(".")) {
            throw new ServiceException("El formato del email es inválido");
        }
    }
}