package com.web.service;

import com.web.exception.ServiceException;
import com.web.model.Producto;
import com.web.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Obtiene solo los productos con estado ACTIVO
    @Override
    public List<Producto> obtenerProductosActivos() {
        try {
            return productoRepository.findByEstado(Producto.EstadoProducto.activo);
        } catch (Exception e) {
            throw new ServiceException("Error de persistencia al obtener productos activos.", e);
        }
    }

    // Obtiene solo los productos activos disponibles en el menú
    @Override
    public List<Producto> obtenerMenuDisponible() {
        try {
            return this.obtenerProductosActivos();
        } catch (Exception e) {
            throw new ServiceException("No se pudo obtener el menú disponible. Fallo en la capa de datos.", e);
        }
    }

    // Guarda o actualiza un producto
    @Override
    public Producto guardarProducto(Producto producto) {
        try {
            if (producto == null) {
                throw new ServiceException("El producto no puede ser nulo.");
            }
            BigDecimal precio = producto.getPrecio();
            if (precio == null || precio.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ServiceException("El precio debe ser mayor a cero.");
            }
            
            return productoRepository.save(producto);
            
        } catch (IllegalArgumentException e) {
            throw e; 
        }
        catch (Exception e) {
            throw new ServiceException("No se pudo guardar el producto. Fallo al escribir en la BD.", e);
        }
    }

    // Busca productos activos por palabra clave en el nombre
    @Override
    public List<Producto> buscarProductos(String keyword) {
        try {
            return productoRepository.findByNombreContainingIgnoreCaseAndEstado(
                keyword,
                Producto.EstadoProducto.activo
            );
        } catch (Exception e) {
            throw new ServiceException("Error al buscar productos por palabra clave.", e);
        }
    }
}
