package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.PedidoRequest;
import com.web.capas.domain.dto.PedidoResponse;
import com.web.capas.domain.dto.PedidoListaResponse;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.application.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // Crea un nuevo pedido (POST /api/v1/pedidos)
    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(@RequestBody PedidoRequest request) {
        PedidoResponse pedido = pedidoService.crearPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    // Obtiene todos los pedidos del usuario (GET /api/v1/pedidos/usuario/{idUsuario})
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PedidoListaResponse>> obtenerPedidosDelUsuario(@PathVariable Integer idUsuario) {
        try {
            List<PedidoListaResponse> pedidos = pedidoService.obtenerPedidosDelUsuarioComoDTO(idUsuario);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            System.err.println("Controller: Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Obtiene un pedido por ID (GET /api/v1/pedidos/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Integer id) {
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        if (pedido == null) {
            throw new RecursoNoEncontradoExcepcion("Pedido no encontrado");
        }
        return ResponseEntity.ok(pedido);
    }
}
