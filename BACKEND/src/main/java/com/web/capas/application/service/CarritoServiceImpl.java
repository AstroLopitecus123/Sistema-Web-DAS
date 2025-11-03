package com.web.capas.application.service;

import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.dto.CarritoItemRequest;
import com.web.capas.domain.dto.CarritoItemResponse;
import com.web.capas.domain.dto.CarritoProductoResponse;
import com.web.capas.domain.repository.CarritoRepository;
import com.web.capas.domain.repository.ProductoRepository;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.infrastructure.persistence.entities.Carrito;
import com.web.capas.infrastructure.persistence.entities.Producto;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CarritoServiceImpl implements CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CarritoItemResponse> obtenerCarritoDelCliente(Integer idCliente) {
        if (idCliente == null) {
            throw new ServiceException("El id del cliente es obligatorio");
        }

        validarExistenciaCliente(idCliente);

        return carritoRepository.findByCliente_IdUsuario(idCliente)
            .stream()
            .map(this::mapearARespuesta)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CarritoItemResponse agregarItem(CarritoItemRequest request) {
        validarRequest(request);

        Usuario cliente = obtenerCliente(request.getIdCliente());
        Producto producto = obtenerProductoActivo(request.getIdProducto());

        Optional<Carrito> existente = carritoRepository.findByCliente_IdUsuarioAndProducto_IdProducto(
            cliente.getIdUsuario(), producto.getIdProducto());

        Carrito carrito = existente.orElseGet(Carrito::new);
        carrito.setCliente(cliente);
        carrito.setProducto(producto);
        carrito.setNotasPersonalizacion(request.getNotasPersonalizacion());
        carrito.setCantidad(request.getCantidad());
        carrito.setFechaAdicion(existente.isPresent() ? carrito.getFechaAdicion() : LocalDateTime.now());

        Carrito guardado = carritoRepository.save(carrito);
        return mapearARespuesta(guardado);
    }

    @Override
    @Transactional
    public CarritoItemResponse actualizarItem(Integer idCarrito, CarritoItemRequest request) {
        if (idCarrito == null) {
            throw new ServiceException("El id del carrito es obligatorio");
        }
        validarRequest(request);

        Carrito carrito = carritoRepository.findById(idCarrito)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Item de carrito no encontrado"));

        if (!carrito.getCliente().getIdUsuario().equals(request.getIdCliente())) {
            throw new ServiceException("El item no pertenece al cliente indicado");
        }

        Producto producto = obtenerProductoActivo(request.getIdProducto());
        carrito.setProducto(producto);
        carrito.setCantidad(request.getCantidad());
        carrito.setNotasPersonalizacion(request.getNotasPersonalizacion());

        Carrito actualizado = carritoRepository.save(carrito);
        return mapearARespuesta(actualizado);
    }

    @Override
    @Transactional
    public void eliminarItem(Integer idCarrito, Integer idCliente) {
        if (idCarrito == null) {
            throw new ServiceException("El id del carrito es obligatorio");
        }
        if (idCliente == null) {
            throw new ServiceException("El id del cliente es obligatorio");
        }

        Carrito carrito = carritoRepository.findById(idCarrito)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Item de carrito no encontrado"));

        if (!carrito.getCliente().getIdUsuario().equals(idCliente)) {
            throw new ServiceException("El item no pertenece al cliente indicado");
        }

        carritoRepository.delete(carrito);
    }

    @Override
    @Transactional
    public void vaciarCarrito(Integer idCliente) {
        if (idCliente == null) {
            throw new ServiceException("El id del cliente es obligatorio");
        }
        validarExistenciaCliente(idCliente);
        carritoRepository.deleteByCliente_IdUsuario(idCliente);
    }

    private void validarRequest(CarritoItemRequest request) {
        if (request == null) {
            throw new ServiceException("La solicitud del carrito es obligatoria");
        }
        if (request.getIdCliente() == null) {
            throw new ServiceException("El id del cliente es obligatorio");
        }
        if (request.getIdProducto() == null) {
            throw new ServiceException("El id del producto es obligatorio");
        }
        if (request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new ServiceException("La cantidad debe ser mayor a cero");
        }
    }

    private Usuario obtenerCliente(Integer idCliente) {
        return usuarioRepository.findById(idCliente)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cliente no encontrado"));
    }

    private Producto obtenerProductoActivo(Integer idProducto) {
        Producto producto = productoRepository.findById(idProducto)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado"));

        if (producto.getEstado() != Producto.EstadoProducto.activo) {
            throw new ServiceException("El producto no está disponible");
        }

        return producto;
    }

    private void validarExistenciaCliente(Integer idCliente) {
        if (!usuarioRepository.existsById(idCliente)) {
            throw new RecursoNoEncontradoExcepcion("Cliente no encontrado");
        }
    }

    private CarritoItemResponse mapearARespuesta(Carrito carrito) {
        CarritoProductoResponse productoResponse = new CarritoProductoResponse();
        productoResponse.setIdProducto(carrito.getProducto().getIdProducto());
        productoResponse.setNombre(carrito.getProducto().getNombre());
        productoResponse.setDescripcion(carrito.getProducto().getDescripcion());
        productoResponse.setPrecio(carrito.getProducto().getPrecio());
        productoResponse.setImagenUrl(carrito.getProducto().getImagenUrl());
        productoResponse.setCategoria(carrito.getProducto().getCategoria().getNombre());

        CarritoItemResponse response = new CarritoItemResponse();
        response.setIdCarrito(carrito.getIdCarrito());
        response.setIdCliente(carrito.getCliente().getIdUsuario());
        response.setProducto(productoResponse);
        response.setCantidad(carrito.getCantidad());
        response.setNotasPersonalizacion(carrito.getNotasPersonalizacion());
        response.setFechaAdicion(carrito.getFechaAdicion());
        return response;
    }
}

