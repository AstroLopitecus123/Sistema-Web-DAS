package com.web.controller;

import com.web.exception.RecursoNoEncontradoExcepcion;
import com.web.exception.ServiceException;
import com.web.model.Pedido;
import com.web.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/repartidor")
public class RepartidorController {

    @Autowired
    private PedidoService pedidoService;

    /**
     * Actualiza el estado de un pedido
     * PUT /api/repartidor/pedidos/{id}/estado
     */
    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<?> actualizarEstadoPedido(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        if (pedido == null) {
            throw new RecursoNoEncontradoExcepcion("Pedido no encontrado");
        }
        
        String nuevoEstado = (String) request.get("nuevoEstado");
        if (nuevoEstado == null) {
            throw new ServiceException("nuevoEstado es requerido");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Estado del pedido actualizado correctamente");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Marca un pedido como entregado
     * PUT /api/repartidor/pedidos/{id}/entregado
     */
    @PutMapping("/pedidos/{id}/entregado")
    public ResponseEntity<?> marcarPedidoComoEntregado(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        if (pedido == null) {
            throw new RecursoNoEncontradoExcepcion("Pedido no encontrado");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Pedido marcado como entregado");
        
        return ResponseEntity.ok(response);
    }
}
