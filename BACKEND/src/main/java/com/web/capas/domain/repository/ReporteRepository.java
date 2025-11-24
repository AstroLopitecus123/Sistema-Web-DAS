package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Integer> {
    
    // Buscar reportes por tipo
    List<Reporte> findByTipoReporteOrderByFechaGeneracionDesc(Reporte.TipoReporte tipoReporte);
    
    // Buscar reportes por admin
    List<Reporte> findByGeneradoPorAdmin_IdUsuarioOrderByFechaGeneracionDesc(Integer idAdmin);
    
    // Buscar todos los reportes ordenados por fecha
    List<Reporte> findAllByOrderByFechaGeneracionDesc();
}

