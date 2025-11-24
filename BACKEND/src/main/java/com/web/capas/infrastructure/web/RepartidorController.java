package com.web.capas.infrastructure.web;

import com.web.capas.application.service.PedidoService;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.dto.ActualizarEstadoPedidoRequest;
import com.web.capas.domain.dto.PedidoListaResponse;
import com.web.capas.domain.dto.PedidoResponse;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/repartidor")
public class RepartidorController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping("/pedidos/disponibles")
    public ResponseEntity<List<PedidoListaResponse>> obtenerPedidosDisponibles() {
        List<PedidoListaResponse> pedidos = pedidoService.obtenerPedidosDisponibles();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/pedidos/mios/{idRepartidor}")
    public ResponseEntity<List<PedidoListaResponse>> obtenerMisPedidos(@PathVariable Integer idRepartidor) {
        List<PedidoListaResponse> pedidos = pedidoService.obtenerPedidosDelRepartidor(idRepartidor);
        return ResponseEntity.ok(pedidos);
    }

    @PostMapping("/pedidos/{id}/aceptar")
    public ResponseEntity<Map<String, Object>> aceptarPedido(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> request) {
        
        Integer idRepartidor = request.get("idRepartidor");
        if (idRepartidor == null) {
            throw new ServiceException("idRepartidor es requerido");
        }
        
        PedidoResponse pedido = pedidoService.aceptarPedido(id, idRepartidor);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Pedido aceptado correctamente",
            "pedido", pedido
        ));
    }

    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<Map<String, Object>> actualizarEstadoPedido(
            @PathVariable Integer id,
            @RequestBody ActualizarEstadoPedidoRequest request) {
        
        pedidoService.obtenerPedidoPorId(id);
        
        String nuevoEstado = request.getNuevoEstado();
        if (nuevoEstado == null) {
            throw new ServiceException("nuevoEstado es requerido");
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Estado del pedido actualizado correctamente"
        ));
    }

    @PutMapping("/pedidos/{id}/entregado")
    public ResponseEntity<Map<String, Object>> marcarPedidoComoEntregado(@PathVariable Integer id) {
        pedidoService.marcarPedidoComoEntregado(id);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Pedido marcado como entregado correctamente"
        ));
    }

    @GetMapping("/historial/{idRepartidor}")
    public ResponseEntity<List<PedidoListaResponse>> obtenerHistorialEntregas(@PathVariable Integer idRepartidor) {
        List<PedidoListaResponse> historial = pedidoService.obtenerHistorialEntregas(idRepartidor);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/estadisticas/{idRepartidor}")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(@PathVariable Integer idRepartidor) {
        Map<String, Object> estadisticas = pedidoService.obtenerEstadisticasRepartidor(idRepartidor);
        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/pedidos/cliente/{idCliente}/historial")
    public ResponseEntity<List<PedidoListaResponse>> obtenerHistorialCliente(
            @PathVariable Integer idCliente,
            @RequestParam(name = "limite", defaultValue = "10") Integer limite) {
        List<PedidoListaResponse> historial = pedidoService.obtenerHistorialCliente(idCliente, limite);
        return ResponseEntity.ok(historial);
    }

    @PutMapping("/pedidos/{id}/cancelar")
    public ResponseEntity<Map<String, Object>> cancelarPedido(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> request) {
        Integer idRepartidor = request.get("idRepartidor");
        if (idRepartidor == null) {
            throw new ServiceException("idRepartidor es requerido");
        }
        PedidoResponse pedido = pedidoService.cancelarPedidoRepartidor(id, idRepartidor);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Pedido liberado correctamente",
            "pedido", pedido
        ));
    }

    @PostMapping("/pedidos/{id}/reportar-problema")
    public ResponseEntity<Map<String, Object>> reportarProblema(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        Integer idRepartidor = request.get("idRepartidor") != null ? Integer.valueOf(request.get("idRepartidor").toString()) : null;
        String descripcion = request.get("descripcion") != null ? request.get("descripcion").toString() : null;
        if (idRepartidor == null) {
            throw new ServiceException("idRepartidor es requerido");
        }
        if (descripcion == null || descripcion.trim().isEmpty()) {
            throw new ServiceException("La descripción del problema es obligatoria");
        }
        PedidoResponse pedido = pedidoService.reportarProblema(id, idRepartidor, descripcion);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Problema reportado correctamente",
            "pedido", pedido
        ));
    }

    @GetMapping("/pedidos/reportes")
    public ResponseEntity<List<com.web.capas.domain.dto.ReporteProblemaResponse>> obtenerReportesProblemas() {
        List<com.web.capas.domain.dto.ReporteProblemaResponse> reportes = pedidoService.obtenerReportesProblemas();
        return ResponseEntity.ok(reportes);
    }

    @PutMapping("/pedidos/{id}/confirmar-pago")
    public ResponseEntity<Map<String, Object>> confirmarPagoRepartidor(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> request) {
        Integer idRepartidor = request.get("idRepartidor");
        if (idRepartidor == null) {
            throw new ServiceException("idRepartidor es requerido");
        }
        PedidoResponse pedido = pedidoService.confirmarPagoEfectivoRepartidor(id, idRepartidor);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Pago confirmado correctamente",
            "pedido", pedido
        ));
    }
}
