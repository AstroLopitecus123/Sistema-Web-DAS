package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    
    // Métodos específicos de negocio
    List<Producto> findByEstado(Producto.EstadoProducto estado);
    List<Producto> findByCategoria_IdCategoria(Integer categoriaId);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByNombreContainingIgnoreCaseAndEstado(String nombre, Producto.EstadoProducto estado);
}
