package com.web.repository;

import com.web.model.Pago;
import com.web.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    
    // Buscar pago por referencia de transacción (PaymentIntent ID de Stripe)
    Optional<Pago> findByReferenciaTransaccion(String referenciaTransaccion);
    
    // Buscar pago por ID de pedido
    Optional<Pago> findByPedido_IdPedido(Integer idPedido);
    
    // Buscar pago por pedido
    Optional<Pago> findByPedido(Pedido pedido);
}
