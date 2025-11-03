package com.web.capas.application.factory;

import com.web.capas.application.service.notificacion.NotificacionService;
import com.web.capas.application.service.notificacion.EmailNotificacionService;
import com.web.capas.application.service.notificacion.WhatsAppNotificacionService;
import com.web.capas.application.service.notificacion.SMSNotificacionService;
import com.web.capas.application.decorator.LoggingNotificacionDecorator;
import com.web.capas.application.decorator.ValidacionNotificacionDecorator;
import com.web.capas.application.decorator.MetricasNotificacionDecorator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NotificacionFactory {
    
    @Autowired
    private EmailNotificacionService emailService;
    
    @Autowired
    private WhatsAppNotificacionService whatsAppService;
    
    @Autowired
    private SMSNotificacionService smsService;

    // FACTORY FUNCTION mejorada con Decorators
    public NotificacionService crearNotificacion(NotificacionType tipo) {
        NotificacionService servicioBase;
        
        switch (tipo) {
            case EMAIL:
                servicioBase = emailService;
                break;
            case WHATSAPP:
                servicioBase = whatsAppService;
                break;
            case SMS:
                servicioBase = smsService;
                break;
            default:
                throw new IllegalArgumentException("Tipo de notificación no soportado: " + tipo);
        }
        
        //APLICAR DECORATORS EN CADENA - Crear instancias manualmente
        NotificacionService servicioDecorado = servicioBase;
        servicioDecorado = new ValidacionNotificacionDecorator(servicioDecorado);
        servicioDecorado = new LoggingNotificacionDecorator(servicioDecorado);
        servicioDecorado = new MetricasNotificacionDecorator(servicioDecorado);
        
        return servicioDecorado;
    }
}