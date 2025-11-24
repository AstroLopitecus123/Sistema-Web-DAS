package com.web.capas.application.service;

import com.web.capas.domain.dto.PedidoRequest;
import com.web.capas.domain.dto.PedidoResponse;
import com.web.capas.domain.dto.PedidoListaResponse;
import com.web.capas.infrastructure.persistence.entities.Pedido;

import java.util.List;

public interface PedidoService {
    
    PedidoResponse crearPedido(PedidoRequest request);
    
    Pedido obtenerPedidoPorId(Integer idPedido);
    
    PedidoResponse obtenerPedidoPorIdComoDTO(Integer idPedido);
    
    List<Pedido> obtenerPedidosDelUsuario(Integer idUsuario);
    
    List<PedidoListaResponse> obtenerPedidosDelUsuarioComoDTO(Integer idUsuario);
    
    List<PedidoListaResponse> obtenerPedidosDisponibles();
    
    PedidoResponse aceptarPedido(Integer idPedido, Integer idRepartidor);
    
    List<PedidoListaResponse> obtenerPedidosDelRepartidor(Integer idRepartidor);
    
    void marcarPedidoComoEntregado(Integer idPedido);
    
    List<PedidoListaResponse> obtenerHistorialEntregas(Integer idRepartidor);
    
    java.util.Map<String, Object> obtenerEstadisticasRepartidor(Integer idRepartidor);
    
    List<PedidoListaResponse> obtenerHistorialCliente(Integer idCliente, int limite);
    
    PedidoResponse cancelarPedidoRepartidor(Integer idPedido, Integer idRepartidor);
    
    PedidoResponse cancelarPedidoCliente(Integer idPedido, Integer idCliente);
    
    PedidoResponse reportarProblema(Integer idPedido, Integer idRepartidor, String descripcion);

    List<com.web.capas.domain.dto.ReporteProblemaResponse> obtenerReportesProblemas();
    
    PedidoResponse confirmarPagoEfectivoCliente(Integer idPedido, Integer idCliente);
    
    PedidoResponse confirmarPagoEfectivoRepartidor(Integer idPedido, Integer idRepartidor);
    
    long contarCancelacionesPorMetodoPago(Integer idCliente, String metodoPago);
}
