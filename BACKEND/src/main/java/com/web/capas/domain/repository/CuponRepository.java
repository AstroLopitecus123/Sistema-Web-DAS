package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Integer> {
    
    Optional<Cupon> findByCodigo(String codigo);
    
    boolean existsByCodigo(String codigo);
    
    List<Cupon> findByActivoTrueOrderByFechaCreacionDesc();
    
    List<Cupon> findAllByOrderByFechaCreacionDesc();
    
    List<Cupon> findByCreadoPorAdmin_IdUsuarioOrderByFechaCreacionDesc(Integer idAdmin);
}

