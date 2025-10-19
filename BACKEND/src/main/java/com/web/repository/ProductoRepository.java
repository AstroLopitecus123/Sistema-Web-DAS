package com.web.repository;

import com.web.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Buscar productos por estado
    List<Producto> findByEstado(Producto.EstadoProducto estado);

    // Buscar productos por nombre y estado
    List<Producto> findByNombreContainingIgnoreCaseAndEstado(String keyword, Producto.EstadoProducto estado);
}
