package com.web.service;

import com.web.dto.PedidoRequest;
import com.web.dto.PedidoResponse;
import com.web.dto.PedidoListaResponse;
import com.web.model.Pedido;

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
