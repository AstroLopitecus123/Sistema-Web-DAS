package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    
    // Buscar pedidos por cliente
    List<Pedido> findByCliente_IdUsuario(Integer idUsuario);
    
}
