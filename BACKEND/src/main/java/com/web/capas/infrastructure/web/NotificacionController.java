package com.web.capas.infrastructure.web;

import com.web.capas.application.factory.NotificacionType;
import com.web.capas.application.service.WhatsAppService;
import com.web.capas.application.service.notificacion.NotificacionOrchestrator;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.dto.MensajePersonalizadoRequest;
import com.web.capas.domain.dto.NotificacionCancelacionRequest;
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.infrastructure.persistence.entities.MetodoPagoInhabilitado;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notificaciones")
public class NotificacionController {
    @Autowired
    private WhatsAppService whatsAppService;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private NotificacionOrchestrator notificacionOrchestrator;
    
    @Autowired
    private com.web.capas.application.service.MetodoPagoInhabilitadoService metodoPagoInhabilitadoService;
    
    @PutMapping("/pedido/{id}/en-camino")
    public ResponseEntity<?> notificarPedidoEnCamino(@PathVariable Integer id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

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

    @PutMapping("/pedido/{id}/entregado")
    public ResponseEntity<?> notificarPedidoEntregado(@PathVariable Integer id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

        if (pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino) {
            throw new ServiceException("El pedido debe estar en camino para notificar que fue entregado");
        }

        String telefono = pedido.getCliente().getTelefono();
        String nombreCliente = pedido.getCliente().getNombre();

        boolean enviado = false;
        if (telefono != null && !telefono.trim().isEmpty()) {
            enviado = whatsAppService.notificarPedidoEntregado(telefono, id, nombreCliente);
            
            if (enviado) {
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

    @PutMapping("/pedido/{id}/cancelado")
    public ResponseEntity<?> notificarPedidoCancelado(
            @PathVariable Integer id, 
            @RequestBody NotificacionCancelacionRequest request) {
        
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

        String motivo = request.getMotivo();
        if (motivo == null || motivo.trim().isEmpty()) {
            motivo = "Cancelación por parte del restaurante";
        }

        String telefono = pedido.getCliente().getTelefono();
        String nombreCliente = pedido.getCliente().getNombre();

        boolean enviado = false;
        if (telefono != null && !telefono.trim().isEmpty()) {
            enviado = whatsAppService.notificarPedidoCancelado(telefono, id, nombreCliente, motivo);
            
            if (enviado) {
                pedido.setEstadoPedido(Pedido.EstadoPedido.cancelado);
                pedidoRepository.save(pedido);
                
                long cancelaciones = pedidoRepository.countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedido(
                    pedido.getCliente().getIdUsuario(),
                    pedido.getMetodoPago(),
                    Pedido.EstadoPedido.cancelado
                );
                
                if (cancelaciones >= 3) {
                    try {
                        MetodoPagoInhabilitado.MetodoPago metodoPagoEnum = MetodoPagoInhabilitado.MetodoPago.valueOf(
                            pedido.getMetodoPago().toString()
                        );
                        String razon = "Cancelación automática: El cliente ha cancelado 3 o más pedidos con este método de pago";
                        metodoPagoInhabilitadoService.inhabilitarMetodoPago(
                            pedido.getCliente(),
                            metodoPagoEnum,
                            razon
                        );
                    } catch (Exception e) {
                        System.err.println("Error al inhabilitar método de pago: " + e.getMessage());
                    }
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", enviado);
        response.put("mensaje", enviado ? "Notificación enviada exitosamente" : "No se pudo enviar la notificación");
        response.put("telefono", telefono);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/mensaje-personalizado")
    public ResponseEntity<?> enviarMensajePersonalizado(@RequestBody MensajePersonalizadoRequest request) {
        String telefono = request.getTelefono();
        String mensaje = request.getMensaje();

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

    @PostMapping("/enviar-flexible")
    public ResponseEntity<?> enviarNotificacionFlexible(@RequestBody Map<String, String> request) {
        String tipo = request.get("tipo");
        String destinatario = request.get("destinatario");
        String mensaje = request.get("mensaje");

        if (tipo == null || destinatario == null || mensaje == null) {
            throw new ServiceException("tipo, destinatario y mensaje son obligatorios");
        }

        NotificacionType notificacionType = NotificacionType.valueOf(tipo.toUpperCase());
        notificacionOrchestrator.enviar(notificacionType, destinatario, mensaje);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Notificacion " + tipo + " enviada exitosamente",
            "tipo", tipo,
            "destinatario", destinatario
        ));
    }
    
}
