package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.ProductoRequest;
import com.web.capas.domain.dto.ProductoResponse;
import com.web.capas.infrastructure.persistence.entities.OpcionPersonalizacion;
import com.web.capas.application.service.ProductoService;
import com.web.capas.infrastructure.persistence.repositories.OpcionPersonalizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/v1/menu") 
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private OpcionPersonalizacionRepository opcionPersonalizacionRepository;

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoResponse>> obtenerMenu() {
        List<ProductoResponse> productos = productoService.obtenerMenuDisponible();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/productos/buscar")
    public ResponseEntity<List<ProductoResponse>> buscarProductosPorNombre(@RequestParam String keyword) {
        List<ProductoResponse> productosEncontrados = productoService.buscarProductos(keyword);
        return ResponseEntity.ok(productosEncontrados);
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<ProductoResponse> obtenerProducto(@PathVariable Integer id) {
        ProductoResponse producto = productoService.obtenerProductoPorId(id);
        return ResponseEntity.ok(producto);
    }

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

    @GetMapping("/admin/productos")
    public ResponseEntity<List<ProductoResponse>> obtenerProductosParaAdmin() {
        List<ProductoResponse> productos = productoService.obtenerProductosParaAdmin();
        return ResponseEntity.ok(productos);
    }

    @PostMapping("/productos")
    public ResponseEntity<ProductoResponse> crearOActualizarProducto(@RequestBody ProductoRequest request) {
        ProductoResponse productoGuardado = productoService.guardarProducto(request);
        return new ResponseEntity<>(productoGuardado, HttpStatus.CREATED);
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Map<String, Object>> eliminarProducto(@PathVariable Integer id) {
        boolean eliminado = productoService.eliminarProducto(id);
        String accion = eliminado ? "ELIMINADO" : "DESACTIVADO";
        String mensaje = eliminado
            ? "Producto eliminado correctamente"
            : "El producto tiene registros asociados. Se marcó como inactivo.";
        return ResponseEntity.ok(Map.of(
            "success", true,
            "accion", accion,
            "mensaje", mensaje
        ));
    }
}
