package com.web.capas.application.service.notificacion;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.web.capas.application.service.WhatsAppService;

@Service
public class WhatsAppNotificacionService implements NotificacionService {
    
    @Autowired
    private WhatsAppService whatsAppService;
    
    @Override
    public void enviarNotificacion(String destinatario, String mensaje) {
        // Reutiliza tu WhatsAppServiceImpl existente
        whatsAppService.enviarMensaje(destinatario, mensaje);
    }
    
    @Override
    public boolean soportaTipo(String tipo) {
        return "WHATSAPP".equalsIgnoreCase(tipo);
    }
}