package com.web.capas.application.service;

import com.web.capas.domain.dto.PedidoRequest;
import com.web.capas.domain.dto.PedidoResponse;
import com.web.capas.domain.dto.PedidoListaResponse;
import com.web.capas.infrastructure.persistence.entities.Pedido;

import java.util.List;

public interface PedidoService {
    
    // Crear un nuevo pedido
    PedidoResponse crearPedido(PedidoRequest request);
    
    // Obtener pedido por ID
    Pedido obtenerPedidoPorId(Integer idPedido);
    
    // Obtener pedido por ID como DTO
    PedidoResponse obtenerPedidoPorIdComoDTO(Integer idPedido);
    
    // Obtener todos los pedidos del usuario autenticado
    List<Pedido> obtenerPedidosDelUsuario(Integer idUsuario);
    
    List<PedidoListaResponse> obtenerPedidosDelUsuarioComoDTO(Integer idUsuario);
    
    // Obtener pedidos disponibles para repartidores
    List<PedidoListaResponse> obtenerPedidosDisponibles();
    
    // Aceptar un pedido (asignar repartidor)
    PedidoResponse aceptarPedido(Integer idPedido, Integer idRepartidor);
    
    // Obtener pedidos asignados a un repartidor
    List<PedidoListaResponse> obtenerPedidosDelRepartidor(Integer idRepartidor);
    
    // Marca un pedido como entregado
    void marcarPedidoComoEntregado(Integer idPedido);
    
    // Obtener historial de entregas completadas de un repartidor
    List<PedidoListaResponse> obtenerHistorialEntregas(Integer idRepartidor);
    
    // Obtener estadísticas del repartidor
    java.util.Map<String, Object> obtenerEstadisticasRepartidor(Integer idRepartidor);
}
