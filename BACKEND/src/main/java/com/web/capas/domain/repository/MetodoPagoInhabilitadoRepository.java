package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.MetodoPagoInhabilitado;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoInhabilitadoRepository extends JpaRepository<MetodoPagoInhabilitado, Integer> {
    
    Optional<MetodoPagoInhabilitado> findByUsuarioAndMetodoPagoAndActivoTrue(
        Usuario usuario, 
        MetodoPagoInhabilitado.MetodoPago metodoPago
    );
    
    List<MetodoPagoInhabilitado> findByUsuarioAndActivoTrue(Usuario usuario);
    
    long countByUsuarioAndMetodoPago(Usuario usuario, MetodoPagoInhabilitado.MetodoPago metodoPago);
    
    List<MetodoPagoInhabilitado> findAllByOrderByFechaInhabilitacionDesc();
    
    Optional<MetodoPagoInhabilitado> findFirstByUsuarioAndMetodoPagoAndFechaReactivacionIsNotNullOrderByFechaReactivacionDesc(
        Usuario usuario,
        MetodoPagoInhabilitado.MetodoPago metodoPago
    );
}

