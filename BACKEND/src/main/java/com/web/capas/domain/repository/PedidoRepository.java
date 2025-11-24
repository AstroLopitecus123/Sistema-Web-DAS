package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.Pedido;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    
    List<Pedido> findByCliente_IdUsuario(Integer idUsuario);
    
    List<Pedido> findByRepartidor_IdUsuario(Integer repartidorId);
    
    List<Pedido> findByEstadoPedido(Pedido.EstadoPedido estado);
    
    List<Pedido> findByRepartidorIsNullAndEstadoPedidoIn(List<Pedido.EstadoPedido> estados);
    
    List<Pedido> findByRepartidor_IdUsuarioAndEstadoPedidoOrderByFechaEntregaDesc(Integer repartidorId, Pedido.EstadoPedido estado);
    
    List<Pedido> findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
        Integer repartidorId, 
        Pedido.EstadoPedido estado, 
        java.time.LocalDateTime fechaInicio, 
        java.time.LocalDateTime fechaFin
    );
    
    List<Pedido> findByCliente_IdUsuarioOrderByFechaPedidoDesc(Integer idUsuario, Pageable pageable);
    
    List<Pedido> findByCliente_IdUsuarioOrderByFechaPedidoDesc(Integer idUsuario);

    List<Pedido> findByProblemaReportadoTrueOrderByFechaProblemaDesc();
    
    long countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedido(
        Integer idUsuario, 
        Pedido.MetodoPago metodoPago, 
        Pedido.EstadoPedido estadoPedido
    );
    
    long countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedidoAndFechaPedidoAfter(
        Integer idUsuario,
        Pedido.MetodoPago metodoPago,
        Pedido.EstadoPedido estadoPedido,
        java.time.LocalDateTime fechaDesde
    );
    
    List<Pedido> findByFechaPedidoBetween(
        java.time.LocalDateTime fechaInicio,
        java.time.LocalDateTime fechaFin
    );
    
}
