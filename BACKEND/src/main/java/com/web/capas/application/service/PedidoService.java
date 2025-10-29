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
    
    // Obtener todos los pedidos del usuario autenticado
    List<Pedido> obtenerPedidosDelUsuario(Integer idUsuario);
    
    List<PedidoListaResponse> obtenerPedidosDelUsuarioComoDTO(Integer idUsuario);
}
