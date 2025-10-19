package com.web.service;

import com.web.dto.PedidoRequest;
import com.web.dto.PedidoResponse;
import com.web.dto.PedidoListaResponse;
import com.web.dto.ProductoPedidoRequest;
import com.web.dto.ProductoDetalleResponse;
import com.web.dto.ClienteResponse;
import com.web.dto.RepartidorResponse;
import com.web.exception.RecursoNoEncontradoExcepcion;
import com.web.exception.ServiceException;
import com.web.model.Pedido;
import com.web.repository.PedidoRepository;
import com.web.model.Usuario;
import com.web.repository.UsuarioRepository;
import com.web.model.Producto;
import com.web.repository.ProductoRepository;
import com.web.model.DetallePedido;
import com.web.repository.DetallePedidoRepository;
import com.web.model.Pago;
import com.web.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private DetallePedidoRepository detallePedidoRepository;
    
    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private com.web.service.WhatsAppService whatsAppService;

    @Override
    @Transactional
    public PedidoResponse crearPedido(PedidoRequest request) {
        try {
            // Validar que el cliente existe
            Usuario cliente = usuarioRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cliente no encontrado"));
            
            // Validar datos obligatorios
            if (request.getDireccionEntrega() == null || request.getDireccionEntrega().trim().isEmpty()) {
                throw new ServiceException("La dirección de entrega es obligatoria");
            }
            
            if (request.getProductos() == null || request.getProductos().isEmpty()) {
                throw new ServiceException("El pedido debe tener al menos un producto");
            }
            
            // Nuevo pedido
            Pedido pedido = new Pedido();
            pedido.setCliente(cliente);
            pedido.setFechaPedido(LocalDateTime.now());
            pedido.setEstadoPedido(Pedido.EstadoPedido.pendiente);
            pedido.setTotalPedido(request.getTotalPedido());
            pedido.setDireccionEntrega(request.getDireccionEntrega());
            pedido.setNotasCliente(request.getNotasCliente());
            
            
            // Parsear método de pago
            try {
                pedido.setMetodoPago(Pedido.MetodoPago.valueOf(request.getMetodoPago()));
            } catch (IllegalArgumentException e) {
                throw new ServiceException("Método de pago no válido: " + request.getMetodoPago());
            }
            
            // Estado inicial según método
            if (request.getMetodoPago().equals("tarjeta")) {
                pedido.setEstadoPago(Pedido.EstadoPago.pendiente); // Se actualizará cuando Stripe confirme
            } else {
                pedido.setEstadoPago(Pedido.EstadoPago.pendiente); // Pendiente hasta que se confirme manualmente
            }
            
            // Persistir pedido
            Pedido pedidoGuardado = pedidoRepository.save(pedido);
            
            // Detalles del pedido
            for (ProductoPedidoRequest productoRequest : request.getProductos()) {
                // Validar que el producto existe
                Producto producto = productoRepository.findById(productoRequest.getIdProducto())
                    .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado: " + productoRequest.getIdProducto()));
                
                // Nuevo detalle
                DetallePedido detalle = new DetallePedido();
                detalle.setPedido(pedidoGuardado);
                detalle.setProducto(producto);
                detalle.setCantidad(productoRequest.getCantidad());
                detalle.setPrecioUnitario(productoRequest.getPrecioUnitario());
                detalle.setSubtotal(productoRequest.getSubtotal());
                detalle.setNotasPersonalizacion(productoRequest.getNotasPersonalizacion());
                
                detallePedidoRepository.save(detalle);
            }
            
            // Pago para métodos manuales
            if (!request.getMetodoPago().equals("tarjeta")) {
                try {
                    System.out.println("Creando registro de pago para método: " + request.getMetodoPago());
                    Pago pago = new Pago();
                    pago.setPedido(pedidoGuardado);
                    pago.setMonto(request.getTotalPedido());
                    
                    // Convertir string a enum de forma segura
                    Pago.MetodoPago metodoPago;
                    if ("billetera_virtual".equals(request.getMetodoPago())) {
                        metodoPago = Pago.MetodoPago.billetera_virtual;
                    } else if ("efectivo".equals(request.getMetodoPago())) {
                        metodoPago = Pago.MetodoPago.efectivo;
                    } else {
                        throw new ServiceException("Método de pago no válido: " + request.getMetodoPago());
                    }
                    
                    pago.setMetodoPago(metodoPago);
                    pago.setEstadoTransaccion(Pago.EstadoTransaccion.pendiente);
                    pago.setReferenciaTransaccion("MANUAL_" + pedidoGuardado.getIdPedido());
                    pago.setFechaPago(LocalDateTime.now());
                    
                    Pago pagoGuardado = pagoRepository.save(pago);
                    System.out.println("Registro de pago creado exitosamente: " + pagoGuardado.getIdPago());
                    
                    // Marcar como pagado inmediatamente
                    pagoGuardado.setEstadoTransaccion(Pago.EstadoTransaccion.exitoso);
                    pagoRepository.save(pagoGuardado);
                    
                    pedidoGuardado.setEstadoPago(Pedido.EstadoPago.pagado);
                    pedidoRepository.save(pedidoGuardado);
                    
                    // Enviar notificación WhatsApp inmediatamente
                    try {
                        String telefono = pedidoGuardado.getCliente().getTelefono();
                        String nombreCliente = pedidoGuardado.getCliente().getNombre();
                        
                        if (telefono != null && !telefono.trim().isEmpty()) {
                            whatsAppService.notificarPedidoConfirmado(telefono, pedidoGuardado.getIdPedido(), nombreCliente);
                            System.out.println("WhatsApp de confirmación enviado inmediatamente a: " + telefono);
                        } else {
                            System.out.println("Cliente sin teléfono registrado para notificación WhatsApp.");
                        }
                    } catch (Exception e) {
                        System.err.println("Error al enviar WhatsApp de confirmación: " + e.getMessage());
                    }
                    
                } catch (Exception e) {
                    System.err.println("Error al crear registro de pago: " + e.getMessage());
                    throw new ServiceException("Error al crear registro de pago: " + e.getMessage(), e);
                }
            }
            
            // Respuesta
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            PedidoResponse response = new PedidoResponse();
            response.setIdPedido(pedidoGuardado.getIdPedido());
            response.setTotalPedido(pedidoGuardado.getTotalPedido());
            response.setDireccionEntrega(pedidoGuardado.getDireccionEntrega());
            response.setMetodoPago(pedidoGuardado.getMetodoPago().toString());
            response.setEstadoPago(pedidoGuardado.getEstadoPago().toString());
            response.setEstadoPedido(pedidoGuardado.getEstadoPedido().toString());
            response.setFechaPedido(pedidoGuardado.getFechaPedido().format(formatter));
            
            return response;
            
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al crear el pedido: " + e.getMessage(), e);
        }
    }

    @Override
    public Pedido obtenerPedidoPorId(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
    }

    @Override
    public List<Pedido> obtenerPedidosDelUsuario(Integer idUsuario) {
        try {
            // Filtrar pedidos por el ID del usuario (cliente)
            List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuario(idUsuario);
            
            System.out.println("Pedidos encontrados para usuario " + idUsuario + ": " + pedidos.size());
            return pedidos;
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al obtener pedidos del usuario", e);
        }
    }

    @Override
    public List<PedidoListaResponse> obtenerPedidosDelUsuarioComoDTO(Integer idUsuario) {
        try {
            List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuario(idUsuario);
            System.out.println("Pedidos encontrados para usuario " + idUsuario + ": " + pedidos.size());
            
            return pedidos.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al obtener pedidos del usuario", e);
        }
    }

    /**
     * Convierte un Pedido a PedidoListaResponse
     */
    private PedidoListaResponse convertirAPedidoListaResponse(Pedido pedido) {
        PedidoListaResponse response = new PedidoListaResponse();
        
        // Datos básicos del pedido
        response.setIdPedido(pedido.getIdPedido());
        response.setFechaPedido(pedido.getFechaPedido().toString());
        response.setEstadoPedido(pedido.getEstadoPedido().toString());
        response.setTotalPedido(pedido.getTotalPedido());
        response.setDireccionEntrega(pedido.getDireccionEntrega());
        response.setNotasCliente(pedido.getNotasCliente());
        response.setMetodoPago(pedido.getMetodoPago().toString());
        response.setEstadoPago(pedido.getEstadoPago().toString());
        response.setFechaEntrega(pedido.getFechaEntrega() != null ? pedido.getFechaEntrega().toString() : null);
        
        // Cliente
        if (pedido.getCliente() != null) {
            ClienteResponse cliente = new ClienteResponse(
                pedido.getCliente().getIdUsuario(),
                pedido.getCliente().getNombre(),
                pedido.getCliente().getApellido(),
                pedido.getCliente().getTelefono()
            );
            response.setCliente(cliente);
        }
        
        // Repartidor
        if (pedido.getRepartidor() != null) {
            RepartidorResponse repartidor = new RepartidorResponse(
                pedido.getRepartidor().getIdUsuario(),
                pedido.getRepartidor().getNombre(),
                pedido.getRepartidor().getApellido(),
                pedido.getRepartidor().getTelefono()
            );
            response.setRepartidor(repartidor);
        }
        
        // Productos
        if (pedido.getProductos() != null && !pedido.getProductos().isEmpty()) {
            List<ProductoDetalleResponse> productos = pedido.getProductos().stream()
                .map(detalle -> {
                    ProductoDetalleResponse producto = new ProductoDetalleResponse();
                    producto.setIdDetallePedido(detalle.getIdDetallePedido());
                    producto.setIdProducto(detalle.getProducto().getIdProducto());
                    producto.setCantidad(detalle.getCantidad());
                    producto.setPrecioUnitario(detalle.getPrecioUnitario());
                    producto.setSubtotal(detalle.getSubtotal());
                    producto.setNotasPersonalizacion(detalle.getNotasPersonalizacion());
                    
                    // Información del producto si está disponible
                    if (detalle.getProducto() != null) {
                        producto.setNombre(detalle.getProducto().getNombre());
                        producto.setDescripcion(detalle.getProducto().getDescripcion());
                        producto.setImagenUrl(detalle.getProducto().getImagenUrl());
                        producto.setCategoria(detalle.getProducto().getCategoria().getNombre());
                    } else {
                        // Valores por defecto si no hay información del producto
                        producto.setNombre("Producto");
                        producto.setDescripcion("Sin descripción");
                        producto.setCategoria("General");
                    }
                    
                    return producto;
                })
                .collect(Collectors.toList());
            response.setProductos(productos);
        }
        
        return response;
    }
}
