package com.web.capas.infrastructure.persistence.repositories;

import com.web.capas.infrastructure.persistence.entities.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaCarritoRepository extends JpaRepository<Carrito, Integer> {
    
    List<Carrito> findByCliente_IdUsuario(Integer clienteId);
    
    void deleteByCliente_IdUsuario(Integer clienteId);
    
}
