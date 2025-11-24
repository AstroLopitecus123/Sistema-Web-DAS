package com.web.capas.application.service;

import com.web.capas.domain.dto.ReporteResponse;
import com.web.capas.infrastructure.persistence.entities.Reporte;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import java.time.LocalDate;
import java.util.List;

public interface ReporteService {
    
    // Genera reporte de ventas
    ReporteResponse generarReporteVentas(Usuario admin, LocalDate fechaInicio, LocalDate fechaFin);
    
    // Genera reporte de productos más vendidos
    ReporteResponse generarReporteProductosVendidos(Usuario admin, LocalDate fechaInicio, LocalDate fechaFin);
    
    // Genera reporte de ganancias
    ReporteResponse generarReporteGanancias(Usuario admin, LocalDate fechaInicio, LocalDate fechaFin);
    
    // Obtiene todos los reportes generados
    List<Reporte> obtenerTodosLosReportes();
    
    // Obtiene reportes por tipo
    List<Reporte> obtenerReportesPorTipo(Reporte.TipoReporte tipoReporte);
}

