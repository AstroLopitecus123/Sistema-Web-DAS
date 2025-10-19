package com.web.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class WhatsAppServiceImpl implements WhatsAppService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.from}")
    private String twilioWhatsAppNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void notificarPedidoConfirmado(String telefono, Integer idPedido, String nombreCliente) {
        try {
            String mensaje = String.format(
                "¡Hola %s! 🎉\n\n" +
                "Tu pedido #%d ha sido confirmado y está siendo preparado.\n\n" +
                "¡Gracias por elegirnos! 😊",
                nombreCliente, idPedido
            );
            
            enviarMensajeInterno(telefono, mensaje);
            System.out.println("WhatsApp de confirmación enviado a: " + telefono);
            
        } catch (Exception e) {
            System.err.println("Error al enviar WhatsApp de confirmación: " + e.getMessage());
        }
    }

    @Override
    public boolean notificarPedidoEnCamino(String telefono, Integer idPedido, String nombreCliente, String direccion) {
        try {
            String mensaje = String.format(
                "¡Hola %s! 🚚\n\n" +
                "Tu pedido #%d está en camino.\n" +
                "Dirección de entrega: %s\n\n" +
                "¡Prepárate para recibirlo! 😊",
                nombreCliente, idPedido, direccion
            );
            
            enviarMensajeInterno(telefono, mensaje);
            System.out.println("WhatsApp de en camino enviado a: " + telefono);
            return true;
            
        } catch (Exception e) {
            System.err.println("Error al enviar WhatsApp de en camino: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean notificarPedidoEntregado(String telefono, Integer idPedido, String nombreCliente) {
        try {
            String mensaje = String.format(
                "¡Hola %s! ✅\n\n" +
                "Tu pedido #%d ha sido entregado exitosamente.\n\n" +
                "¡Esperamos que disfrutes tu comida! 😊\n" +
                "¡Gracias por elegirnos!",
                nombreCliente, idPedido
            );
            
            enviarMensajeInterno(telefono, mensaje);
            System.out.println("WhatsApp de entregado enviado a: " + telefono);
            return true;
            
        } catch (Exception e) {
            System.err.println("Error al enviar WhatsApp de entregado: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean notificarPedidoCancelado(String telefono, Integer idPedido, String nombreCliente, String motivo) {
        try {
            String mensaje = String.format(
                "¡Hola %s! ❌\n\n" +
                "Lamentamos informarte que tu pedido #%d ha sido cancelado.\n\n" +
                "Motivo: %s\n\n" +
                "Si tienes alguna consulta, no dudes en contactarnos.",
                nombreCliente, idPedido, motivo
            );
            
            enviarMensajeInterno(telefono, mensaje);
            System.out.println("WhatsApp de cancelado enviado a: " + telefono);
            return true;
            
        } catch (Exception e) {
            System.err.println("Error al enviar WhatsApp de cancelado: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean enviarMensaje(String telefono, String mensaje) {
        try {
            enviarMensajeInterno(telefono, mensaje);
            System.out.println("Mensaje personalizado enviado a: " + telefono);
            return true;
            
        } catch (Exception e) {
            System.err.println("Error al enviar mensaje personalizado: " + e.getMessage());
            return false;
        }
    }


    private void enviarMensajeInterno(String telefono, String mensaje) {
        try {
            // Formatear número para WhatsApp
            String numeroFormateado = "whatsapp:" + telefono;
            
            Message.creator(
                new PhoneNumber(numeroFormateado),
                new PhoneNumber(twilioWhatsAppNumber),
                mensaje
            ).create();
            
        } catch (Exception e) {
            System.err.println("Error al enviar mensaje WhatsApp: " + e.getMessage());
            throw e;
        }
    }
}
