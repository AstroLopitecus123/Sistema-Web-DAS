package com.web.controller;

import com.web.model.Producto;
import com.web.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController 
@RequestMapping("/api/v1/menu") 
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // CU (CLIENTE): VER MENÚ
    // GET /api/v1/menu/productos
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> obtenerMenu() {
        List<Producto> productos = productoService.obtenerMenuDisponible();
        return ResponseEntity.ok(productos);
    }

    // CU (CLIENTE): BUSCAR PRODUCTOS (Búsqueda por letras)
    // GET /api/v1/menu/productos/buscar?keyword=hamburg
    @GetMapping("/productos/buscar")
    public ResponseEntity<List<Producto>> buscarProductosPorNombre(@RequestParam String keyword) {
        List<Producto> productosEncontrados = productoService.buscarProductos(keyword);
        return ResponseEntity.ok(productosEncontrados);
    }

    // CU (ADMINISTRADOR): GESTIONAR EL MENÚ (Crear/Actualizar)
    // POST /api/v1/menu/productos
    @PostMapping("/productos")
    public ResponseEntity<Producto> crearOActualizarProducto(@RequestBody Producto producto) {
        Producto productoGuardado = productoService.guardarProducto(producto);
        return new ResponseEntity<>(productoGuardado, HttpStatus.CREATED);
    }
}
