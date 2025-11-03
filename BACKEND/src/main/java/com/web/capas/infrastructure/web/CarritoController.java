package com.web.capas.infrastructure.web;

import com.web.capas.application.service.CarritoService;
import com.web.capas.domain.dto.CarritoItemRequest;
import com.web.capas.domain.dto.CarritoItemResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/carrito")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<CarritoItemResponse>> obtenerCarritoPorCliente(@PathVariable Integer idCliente) {
        List<CarritoItemResponse> items = carritoService.obtenerCarritoDelCliente(idCliente);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<CarritoItemResponse> agregarItem(@RequestBody CarritoItemRequest request) {
        CarritoItemResponse response = carritoService.agregarItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{idCarrito}")
    public ResponseEntity<CarritoItemResponse> actualizarItem(
        @PathVariable Integer idCarrito,
        @RequestBody CarritoItemRequest request) {

        CarritoItemResponse response = carritoService.actualizarItem(idCarrito, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{idCarrito}")
    public ResponseEntity<Void> eliminarItem(
        @PathVariable Integer idCarrito,
        @RequestParam("idCliente") Integer idCliente) {

        carritoService.eliminarItem(idCarrito, idCliente);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cliente/{idCliente}")
    public ResponseEntity<Void> vaciarCarrito(@PathVariable Integer idCliente) {
        carritoService.vaciarCarrito(idCliente);
        return ResponseEntity.noContent().build();
    }
}

