package com.web.capas.infrastructure.persistence.repositories;

import com.web.capas.infrastructure.persistence.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaPedidoRepository extends JpaRepository<Pedido, Integer> {
    
    List<Pedido> findByCliente_IdUsuario(Integer clienteId);
    
    List<Pedido> findByRepartidor_IdUsuario(Integer repartidorId);
    
    List<Pedido> findByEstadoPedido(Pedido.EstadoPedido estado);
    
    // Pedidos disponibles para repartidores (sin repartidor asignado y en estados listos para recoger)
    List<Pedido> findByRepartidorIsNullAndEstadoPedidoIn(List<Pedido.EstadoPedido> estados);
    
    // Obtener pedidos entregados de un repartidor ordenados por fecha de entrega descendente
    List<Pedido> findByRepartidor_IdUsuarioAndEstadoPedidoOrderByFechaEntregaDesc(Integer repartidorId, Pedido.EstadoPedido estado);
    
    // Obtener pedidos entregados de un repartidor en un rango de fechas
    List<Pedido> findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
        Integer repartidorId, 
        Pedido.EstadoPedido estado, 
        java.time.LocalDateTime fechaInicio, 
        java.time.LocalDateTime fechaFin
    );
    
}
