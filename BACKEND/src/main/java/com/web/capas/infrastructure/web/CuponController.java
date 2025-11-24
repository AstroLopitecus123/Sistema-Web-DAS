package com.web.capas.infrastructure.web;

import com.web.capas.application.service.CuponService;
import com.web.capas.domain.dto.CuponRequest;
import com.web.capas.domain.dto.CuponResponse;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cupones")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class CuponController {

    @Autowired
    private CuponService cuponService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCupon(
            @RequestBody CuponRequest request,
            @RequestParam Integer idAdmin) {
        
        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Administrador no encontrado"));
        
        CuponResponse cupon = cuponService.crearCupon(request, admin);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Cupón creado correctamente",
            "cupon", cupon
        ));
    }

    @GetMapping
    public ResponseEntity<List<CuponResponse>> obtenerTodosLosCupones() {
        List<CuponResponse> cupones = cuponService.obtenerTodosLosCupones();
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuponResponse> obtenerCuponPorId(@PathVariable Integer id) {
        CuponResponse cupon = cuponService.obtenerCuponPorId(id);
        return ResponseEntity.ok(cupon);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCupon(
            @PathVariable Integer id,
            @RequestBody CuponRequest request) {
        
        CuponResponse cupon = cuponService.actualizarCupon(id, request);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Cupón actualizado correctamente",
            "cupon", cupon
        ));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstadoCupon(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> request) {
        
        Boolean activo = request.get("activo");
        if (activo == null) {
            throw new ServiceException("El campo 'activo' es requerido");
        }
        
        CuponResponse cupon = cuponService.cambiarEstadoCupon(id, activo);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", activo ? "Cupón activado correctamente" : "Cupón desactivado correctamente",
            "cupon", cupon
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCupon(@PathVariable Integer id) {
        boolean eliminado = cuponService.eliminarCupon(id);
        return ResponseEntity.ok(Map.of(
            "success", eliminado,
            "mensaje", "Cupón eliminado correctamente"
        ));
    }
}

