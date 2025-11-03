package com.web.capas.application.service;

import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.dto.CategoriaResponse;
import com.web.capas.domain.dto.ProductoRequest;
import com.web.capas.domain.dto.ProductoResponse;
import com.web.capas.infrastructure.persistence.entities.Categoria;
import com.web.capas.infrastructure.persistence.entities.Producto;
import com.web.capas.domain.repository.ProductoRepository;
import com.web.capas.infrastructure.persistence.repositories.JpaCategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private JpaCategoriaRepository categoriaRepository;

    // Obtiene solo los productos con estado ACTIVO
    @Override
    public List<ProductoResponse> obtenerProductosActivos() {
        try {
            return productoRepository.findByEstado(Producto.EstadoProducto.activo)
                .stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            throw new ServiceException("Error de persistencia al obtener productos activos.", e);
        }
    }

    // Obtiene solo los productos activos disponibles en el menú
    @Override
    public List<ProductoResponse> obtenerMenuDisponible() {
        try {
            return this.obtenerProductosActivos();
        } catch (Exception e) {
            throw new ServiceException("No se pudo obtener el menú disponible. Fallo en la capa de datos.", e);
        }
    }

    // Guarda o actualiza un producto
    @Override
    public ProductoResponse guardarProducto(ProductoRequest request) {
        try {
            validarRequest(request);

            Categoria categoria = categoriaRepository.findById(request.getIdCategoria())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("La categoría indicada no existe"));

            Producto producto = request.getIdProducto() != null
                ? productoRepository.findById(request.getIdProducto())
                    .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado para actualización"))
                : new Producto();

            if (producto.getIdProducto() == null) {
                producto.setFechaCreacion(LocalDateTime.now());
            }

            producto.setNombre(request.getNombre().trim());
            producto.setDescripcion(request.getDescripcion());
            producto.setPrecio(request.getPrecio());
            producto.setCategoria(categoria);
            producto.setImagenUrl(request.getImagenUrl());
            Producto.EstadoProducto estado = request.getEstado() != null
                ? parsearEstado(request.getEstado())
                : (producto.getEstado() != null ? producto.getEstado() : Producto.EstadoProducto.activo);
            producto.setEstado(estado);
            producto.setUltimaActualizacion(LocalDateTime.now());

            Producto guardado = productoRepository.save(producto);
            return mapearAResponse(guardado);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("No se pudo guardar el producto. Fallo al escribir en la BD.", e);
        }
    }

    // Busca productos activos por palabra clave en el nombre
    @Override
    public List<ProductoResponse> buscarProductos(String keyword) {
        try {
            return productoRepository.findByNombreContainingIgnoreCaseAndEstado(
                    keyword,
                    Producto.EstadoProducto.activo
                ).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            throw new ServiceException("Error al buscar productos por palabra clave.", e);
        }
    }

    private void validarRequest(ProductoRequest request) {
        if (request == null) {
            throw new ServiceException("El payload de producto es obligatorio");
        }
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre del producto es obligatorio");
        }
        if (request.getPrecio() == null || request.getPrecio().signum() <= 0) {
            throw new ServiceException("El precio debe ser mayor a cero");
        }
        if (request.getIdCategoria() == null) {
            throw new ServiceException("La categoría es obligatoria");
        }
    }

    private Producto.EstadoProducto parsearEstado(String estado) {
        if (estado == null || estado.trim().isEmpty()) {
            return Producto.EstadoProducto.activo;
        }
        try {
            return Producto.EstadoProducto.valueOf(estado.toLowerCase());
        } catch (IllegalArgumentException ex) {
            throw new ServiceException("Estado de producto inválido: " + estado);
        }
    }

    private ProductoResponse mapearAResponse(Producto producto) {
        ProductoResponse response = new ProductoResponse();
        response.setIdProducto(producto.getIdProducto());
        response.setNombre(producto.getNombre());
        response.setDescripcion(producto.getDescripcion());
        response.setPrecio(producto.getPrecio());
        response.setImagenUrl(producto.getImagenUrl());
        response.setEstado(producto.getEstado() != null ? producto.getEstado().toString() : null);
        response.setFechaCreacion(producto.getFechaCreacion());
        response.setUltimaActualizacion(producto.getUltimaActualizacion());

        if (producto.getCategoria() != null) {
            CategoriaResponse categoriaResponse = new CategoriaResponse();
            categoriaResponse.setIdCategoria(producto.getCategoria().getIdCategoria());
            categoriaResponse.setNombre(producto.getCategoria().getNombre());
            categoriaResponse.setDescripcion(producto.getCategoria().getDescripcion());
            response.setCategoria(categoriaResponse);
        }

        return response;
    }
}