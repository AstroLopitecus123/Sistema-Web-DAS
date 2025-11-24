package com.web.capas.infrastructure.web;

import com.web.capas.application.service.MetodoPagoInhabilitadoService;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.infrastructure.persistence.entities.MetodoPagoInhabilitado;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/metodos-pago-inhabilitados")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class MetodoPagoInhabilitadoController {

    @Autowired
    private MetodoPagoInhabilitadoService metodoPagoInhabilitadoService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<MetodoPagoInhabilitado>> obtenerInhabilitacionesActivas() {
        List<MetodoPagoInhabilitado> inhabilitaciones = metodoPagoInhabilitadoService.obtenerInhabilitacionesActivas();
        return ResponseEntity.ok(inhabilitaciones);
    }

    @PutMapping("/{idInhabilitacion}/reactivar")
    public ResponseEntity<Map<String, Object>> reactivarMetodoPago(
            @PathVariable Integer idInhabilitacion,
            @RequestParam Integer idAdmin) {
        
        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Administrador no encontrado"));
        
        MetodoPagoInhabilitado inhabilitacion = metodoPagoInhabilitadoService.reactivarMetodoPago(idInhabilitacion, admin);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Método de pago reactivado correctamente",
            "inhabilitacion", inhabilitacion
        ));
    }
}

