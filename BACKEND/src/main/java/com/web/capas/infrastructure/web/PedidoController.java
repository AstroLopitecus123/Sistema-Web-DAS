package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.PedidoRequest;
import com.web.capas.domain.dto.PedidoResponse;
import com.web.capas.domain.dto.PedidoListaResponse;
import com.web.capas.application.service.PedidoService;
import com.web.capas.domain.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(@RequestBody PedidoRequest request) {
        PedidoResponse pedido = pedidoService.crearPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PedidoListaResponse>> obtenerPedidosDelUsuario(@PathVariable Integer idUsuario) {
        List<PedidoListaResponse> pedidos = pedidoService.obtenerPedidosDelUsuarioComoDTO(idUsuario);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtenerPedidoPorId(@PathVariable Integer id) {
        PedidoResponse pedido = pedidoService.obtenerPedidoPorIdComoDTO(id);
        return ResponseEntity.ok(pedido);
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Map<String, Object>> cancelarPedido(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> request) {
        Integer idCliente = request.get("idCliente");
        if (idCliente == null) {
            throw new ServiceException("idCliente es requerido");
        }
        PedidoResponse pedido = pedidoService.cancelarPedidoCliente(id, idCliente);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Pedido cancelado correctamente");
        response.put("pedido", pedido);
        
        long cancelaciones = pedidoService.contarCancelacionesPorMetodoPago(idCliente, pedido.getMetodoPago());
        if (cancelaciones >= 3) {
            response.put("metodoPagoInhabilitado", true);
            String nombreMetodoPago = obtenerNombreMetodoPago(pedido.getMetodoPago());
            response.put("nombreMetodoPago", nombreMetodoPago);
        }
        
        return ResponseEntity.ok(response);
    }
    
    private String obtenerNombreMetodoPago(String metodoPago) {
        if (metodoPago == null) return "";
        switch (metodoPago.toLowerCase()) {
            case "tarjeta":
                return "Tarjeta de Crédito/Débito";
            case "billetera_virtual":
                return "Billetera Virtual";
            case "efectivo":
                return "Efectivo";
            default:
                return metodoPago;
        }
    }

    @PutMapping("/{id}/confirmar-pago-cliente")
    public ResponseEntity<Map<String, Object>> confirmarPagoCliente(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> request) {
        Integer idCliente = request.get("idCliente");
        if (idCliente == null) {
            throw new ServiceException("idCliente es requerido");
        }
        PedidoResponse pedido = pedidoService.confirmarPagoEfectivoCliente(id, idCliente);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Pago confirmado correctamente",
            "pedido", pedido
        ));
    }
}
