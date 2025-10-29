package com.web.capas.infrastructure.web;

import com.web.capas.infrastructure.persistence.entities.Producto;
import com.web.capas.infrastructure.persistence.entities.OpcionPersonalizacion;
import com.web.capas.application.service.ProductoService;
import com.web.capas.infrastructure.persistence.repositories.OpcionPersonalizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController 
@RequestMapping("/api/v1/menu") 
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private OpcionPersonalizacionRepository opcionPersonalizacionRepository;

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

    // CU (CLIENTE): OBTENER OPCIONES DE PERSONALIZACIÓN
    // GET /api/v1/menu/productos/{id}/opciones
    @GetMapping("/productos/{id}/opciones")
    @Transactional(readOnly = true)
    public ResponseEntity<List<OpcionPersonalizacion>> obtenerOpcionesPersonalizacion(@PathVariable Integer id) {
        try {
            List<OpcionPersonalizacion> opciones = opcionPersonalizacionRepository.findByProducto_IdProductoAndActivaTrue(id);
            return ResponseEntity.ok(opciones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // CU (ADMINISTRADOR): GESTIONAR EL MENÚ (Crear/Actualizar)
    // POST /api/v1/menu/productos
    @PostMapping("/productos")
    public ResponseEntity<Producto> crearOActualizarProducto(@RequestBody Producto producto) {
        Producto productoGuardado = productoService.guardarProducto(producto);
        return new ResponseEntity<>(productoGuardado, HttpStatus.CREATED);
    }
}
