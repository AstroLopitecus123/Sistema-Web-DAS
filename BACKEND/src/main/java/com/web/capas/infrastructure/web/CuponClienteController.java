package com.web.capas.infrastructure.web;

import com.web.capas.application.service.CuponService;
import com.web.capas.domain.dto.CuponResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cupones")
public class CuponClienteController {

    @Autowired
    private CuponService cuponService;

    @GetMapping("/disponibles/{idUsuario}")
    public ResponseEntity<List<CuponResponse>> obtenerCuponesDisponibles(@PathVariable Integer idUsuario) {
        List<CuponResponse> cupones = cuponService.obtenerCuponesDisponibles(idUsuario);
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/usados/{idUsuario}")
    public ResponseEntity<List<CuponResponse>> obtenerCuponesUsados(@PathVariable Integer idUsuario) {
        List<CuponResponse> cupones = cuponService.obtenerCuponesUsados(idUsuario);
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/expirados/{idUsuario}")
    public ResponseEntity<List<CuponResponse>> obtenerCuponesExpirados(@PathVariable Integer idUsuario) {
        List<CuponResponse> cupones = cuponService.obtenerCuponesExpirados(idUsuario);
        return ResponseEntity.ok(cupones);
    }
}

