package com.web.capas.infrastructure.web;

import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.application.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notificaciones")
public class NotificacionController {

    @Autowired
    private WhatsAppService whatsAppService;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    // Notifica que un pedido está en camino (PUT /api/admin/notificaciones/pedido/{id}/en-camino)
    @PutMapping("/pedido/{id}/en-camino")
    public ResponseEntity<?> notificarPedidoEnCamino(@PathVariable Integer id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

        // Verificar que esté pagado
        if (pedido.getEstadoPago() != Pedido.EstadoPago.pagado) {
            throw new ServiceException("El pedido debe estar pagado para notificar que está en camino");
        }

        String telefono = pedido.getCliente().getTelefono();
        String nombreCliente = pedido.getCliente().getNombre();
        String direccion = pedido.getDireccionEntrega();

        boolean enviado = false;
        if (telefono != null && !telefono.trim().isEmpty()) {
            enviado = whatsAppService.notificarPedidoEnCamino(telefono, id, nombreCliente, direccion);
            
            if (enviado) {
                // Marcar como en camino
                pedido.setEstadoPedido(Pedido.EstadoPedido.en_camino);
                pedidoRepository.save(pedido);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", enviado);
        response.put("mensaje", enviado ? "Notificación enviada exitosamente" : "No se pudo enviar la notificación");
        response.put("telefono", telefono);

        return ResponseEntity.ok(response);
    }

    // Notifica que un pedido ha sido entregado (PUT /api/admin/notificaciones/pedido/{id}/entregado)
    @PutMapping("/pedido/{id}/entregado")
    public ResponseEntity<?> notificarPedidoEntregado(@PathVariable Integer id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

        // Verificar que esté en camino
        if (pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino) {
            throw new ServiceException("El pedido debe estar en camino para notificar que fue entregado");
        }

        String telefono = pedido.getCliente().getTelefono();
        String nombreCliente = pedido.getCliente().getNombre();

        boolean enviado = false;
        if (telefono != null && !telefono.trim().isEmpty()) {
            enviado = whatsAppService.notificarPedidoEntregado(telefono, id, nombreCliente);
            
            if (enviado) {
                // Marcar como entregado
                pedido.setEstadoPedido(Pedido.EstadoPedido.entregado);
                pedidoRepository.save(pedido);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", enviado);
        response.put("mensaje", enviado ? "Notificación enviada exitosamente" : "No se pudo enviar la notificación");
        response.put("telefono", telefono);

        return ResponseEntity.ok(response);
    }

    // Notifica que un pedido ha sido cancelado (PUT /api/admin/notificaciones/pedido/{id}/cancelado)
    @PutMapping("/pedido/{id}/cancelado")
    public ResponseEntity<?> notificarPedidoCancelado(
            @PathVariable Integer id, 
            @RequestBody Map<String, String> request) {
        
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

        String motivo = request.get("motivo");
        if (motivo == null || motivo.trim().isEmpty()) {
            motivo = "Cancelación por parte del restaurante";
        }

        String telefono = pedido.getCliente().getTelefono();
        String nombreCliente = pedido.getCliente().getNombre();

        boolean enviado = false;
        if (telefono != null && !telefono.trim().isEmpty()) {
            enviado = whatsAppService.notificarPedidoCancelado(telefono, id, nombreCliente, motivo);
            
            if (enviado) {
                // Marcar como cancelado
                pedido.setEstadoPedido(Pedido.EstadoPedido.cancelado);
                pedidoRepository.save(pedido);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", enviado);
        response.put("mensaje", enviado ? "Notificación enviada exitosamente" : "No se pudo enviar la notificación");
        response.put("telefono", telefono);

        return ResponseEntity.ok(response);
    }

    // Envía mensaje personalizado por WhatsApp (POST /api/admin/notificaciones/mensaje-personalizado)
    @PostMapping("/mensaje-personalizado")
    public ResponseEntity<?> enviarMensajePersonalizado(@RequestBody Map<String, String> request) {
        String telefono = request.get("telefono");
        String mensaje = request.get("mensaje");

        if (telefono == null || telefono.trim().isEmpty()) {
            throw new ServiceException("El teléfono es obligatorio");
        }

        if (mensaje == null || mensaje.trim().isEmpty()) {
            throw new ServiceException("El mensaje es obligatorio");
        }

        boolean enviado = whatsAppService.enviarMensaje(telefono, mensaje);

        Map<String, Object> response = new HashMap<>();
        response.put("success", enviado);
        response.put("mensaje", enviado ? "Mensaje enviado exitosamente" : "No se pudo enviar el mensaje");
        response.put("telefono", telefono);

        return ResponseEntity.ok(response);
    }
}
