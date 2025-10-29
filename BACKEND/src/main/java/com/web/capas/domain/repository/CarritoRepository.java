package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {
    
    // Buscar carrito por cliente
    List<Carrito> findByCliente_IdUsuario(Integer idUsuario);
    
    // Eliminar carrito por cliente
    void deleteByCliente_IdUsuario(Integer idUsuario);
    
}
