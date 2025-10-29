package com.web.capas.infrastructure.persistence.repositories;

import com.web.capas.infrastructure.persistence.entities.Pago;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaPagoRepository extends JpaRepository<Pago, Integer> {
    
    Optional<Pago> findByPedido(Pedido pedido);
    
}
