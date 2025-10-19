package com.web.controller;

import com.web.dto.PedidoRequest;
import com.web.dto.PedidoResponse;
import com.web.dto.PedidoListaResponse;
import com.web.exception.RecursoNoEncontradoExcepcion;
import com.web.model.Pedido;
import com.web.service.PedidoService;
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

    /**
     * Endpoint para crear un nuevo pedido
     * POST /api/v1/pedidos
     */
    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(@RequestBody PedidoRequest request) {
        PedidoResponse pedido = pedidoService.crearPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    /**
     * Obtiene todos los pedidos del usuario especificado
     * GET /api/v1/pedidos/usuario/{idUsuario}
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PedidoListaResponse>> obtenerPedidosDelUsuario(@PathVariable Integer idUsuario) {
        try {
            System.out.println("Controller: Iniciando obtención de pedidos para usuario: " + idUsuario);
            List<PedidoListaResponse> pedidos = pedidoService.obtenerPedidosDelUsuarioComoDTO(idUsuario);
            System.out.println("Controller: Pedidos obtenidos exitosamente para usuario " + idUsuario + ": " + pedidos.size());
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            System.err.println("Controller: Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Obtiene un pedido específico por ID
     * GET /api/v1/pedidos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Integer id) {
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        if (pedido == null) {
            throw new RecursoNoEncontradoExcepcion("Pedido no encontrado");
        }
        return ResponseEntity.ok(pedido);
    }
}
