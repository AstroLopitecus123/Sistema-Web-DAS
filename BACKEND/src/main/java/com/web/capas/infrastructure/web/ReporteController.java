package com.web.capas.infrastructure.web;

import com.web.capas.application.service.ConfiguracionSistemaService;
import com.web.capas.application.service.ReporteService;
import com.web.capas.domain.dto.ReporteResponse;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.infrastructure.persistence.entities.Reporte;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reportes")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ConfiguracionSistemaService configuracionSistemaService;

    @PostMapping("/ventas")
    public ResponseEntity<ReporteResponse> generarReporteVentas(
            @RequestParam(required = false) Integer idAdmin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Administrador no encontrado"));
        
        return ResponseEntity.ok(reporteService.generarReporteVentas(admin, fechaInicio, fechaFin));
    }

    @PostMapping("/productos-vendidos")
    public ResponseEntity<ReporteResponse> generarReporteProductosVendidos(
            @RequestParam(required = false) Integer idAdmin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Administrador no encontrado"));
        
        return ResponseEntity.ok(reporteService.generarReporteProductosVendidos(admin, fechaInicio, fechaFin));
    }

    @PostMapping("/ganancias")
    public ResponseEntity<ReporteResponse> generarReporteGanancias(
            @RequestParam(required = false) Integer idAdmin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Administrador no encontrado"));
        
        return ResponseEntity.ok(reporteService.generarReporteGanancias(admin, fechaInicio, fechaFin));
    }

    @GetMapping
    public ResponseEntity<List<Reporte>> obtenerTodosLosReportes() {
        return ResponseEntity.ok(reporteService.obtenerTodosLosReportes());
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Reporte>> obtenerReportesPorTipo(@PathVariable String tipo) {
        try {
            Reporte.TipoReporte tipoReporte = Reporte.TipoReporte.valueOf(tipo);
            return ResponseEntity.ok(reporteService.obtenerReportesPorTipo(tipoReporte));
        } catch (IllegalArgumentException e) {
            throw new ServiceException("Tipo de reporte no válido: " + tipo);
        }
    }

    @GetMapping("/configuracion/porcentaje-costo")
    public ResponseEntity<Map<String, Object>> obtenerPorcentajeCosto() {
        BigDecimal porcentaje = configuracionSistemaService.obtenerPorcentajeCosto();
        Map<String, Object> response = new HashMap<>();
        response.put("porcentaje", porcentaje.doubleValue());
        response.put("porcentajePorcentaje", porcentaje.multiply(new BigDecimal("100")).doubleValue());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/configuracion/porcentaje-costo")
    public ResponseEntity<Map<String, Object>> actualizarPorcentajeCosto(@RequestBody Map<String, Object> request) {
        Object porcentajeObj = request.get("porcentaje");
        if (porcentajeObj == null) {
            throw new ServiceException("El porcentaje es requerido");
        }
        
        BigDecimal porcentaje;
        try {
            if (porcentajeObj instanceof Number) {
                porcentaje = BigDecimal.valueOf(((Number) porcentajeObj).doubleValue());
            } else if (porcentajeObj instanceof String) {
                porcentaje = new BigDecimal((String) porcentajeObj);
            } else {
                throw new ServiceException("Formato de porcentaje inválido");
            }
        } catch (NumberFormatException e) {
            throw new ServiceException("Formato de porcentaje inválido");
        }

        if (porcentaje.compareTo(BigDecimal.ZERO) < 0 || porcentaje.compareTo(BigDecimal.ONE) > 0) {
            throw new ServiceException("El porcentaje debe estar entre 0 y 1 (ej: 0.60 = 60%)");
        }

        configuracionSistemaService.actualizarPorcentajeCosto(porcentaje);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Porcentaje de costo actualizado correctamente");
        response.put("porcentaje", porcentaje.doubleValue());
        response.put("porcentajePorcentaje", porcentaje.multiply(new BigDecimal("100")).doubleValue());
        return ResponseEntity.ok(response);
    }
}

