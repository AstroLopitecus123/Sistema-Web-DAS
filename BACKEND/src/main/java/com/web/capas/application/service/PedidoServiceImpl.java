package com.web.capas.application.service;

import com.web.capas.domain.dto.PedidoRequest;
import com.web.capas.domain.dto.PedidoResponse;
import com.web.capas.domain.dto.PedidoListaResponse;
import com.web.capas.domain.dto.ProductoPedidoRequest;
import com.web.capas.domain.dto.ProductoDetalleResponse;
import com.web.capas.domain.dto.ClienteResponse;
import com.web.capas.domain.dto.RepartidorResponse;
import com.web.capas.domain.dto.ReporteProblemaResponse;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import com.web.capas.infrastructure.persistence.entities.Producto;
import com.web.capas.infrastructure.persistence.entities.DetallePedido;
import com.web.capas.infrastructure.persistence.entities.Pago;
import com.web.capas.infrastructure.persistence.entities.MetodoPagoInhabilitado;
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.domain.repository.ProductoRepository;
import com.web.capas.domain.repository.DetallePedidoRepository;
import com.web.capas.domain.repository.PagoRepository;
import com.web.capas.domain.repository.CuponRepository;
import com.web.capas.application.service.WhatsAppService; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("unused")
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
    private WhatsAppService whatsAppService;
    
    @Autowired
    private MetodoPagoInhabilitadoService metodoPagoInhabilitadoService;
    
    @Autowired
    private com.web.capas.domain.repository.MetodoPagoInhabilitadoRepository metodoPagoInhabilitadoRepository;
    
    @Autowired
    private CuponService cuponService;
    
    @Autowired
    private CuponRepository cuponRepository;
    
    @Autowired
    private OneSignalSender oneSignalSender;

    @Override
    @Transactional
    public PedidoResponse crearPedido(PedidoRequest request) {
        try {
            Usuario cliente = usuarioRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cliente no encontrado"));
            
            if (request.getDireccionEntrega() == null || request.getDireccionEntrega().trim().isEmpty()) {
                throw new ServiceException("La dirección de entrega es obligatoria");
            }
            
            if (request.getProductos() == null || request.getProductos().isEmpty()) {
                throw new ServiceException("El pedido debe tener al menos un producto");
            }
            
            try {
                Pedido.MetodoPago metodoPagoEnum = Pedido.MetodoPago.valueOf(request.getMetodoPago());
                if (metodoPagoInhabilitadoService.estaInhabilitado(cliente, 
                    MetodoPagoInhabilitado.MetodoPago.valueOf(request.getMetodoPago()))) {
                    String nombreMetodoPago = obtenerNombreMetodoPago(
                        MetodoPagoInhabilitado.MetodoPago.valueOf(request.getMetodoPago())
                    );
                    throw new ServiceException(
                        String.format(
                            "El método de pago %s está bloqueado. Ha sido inhabilitado debido a múltiples cancelaciones. Por favor, contacta al administrador o utiliza otro método de pago.",
                            nombreMetodoPago
                        )
                    );
                }
            } catch (IllegalArgumentException e) {
                throw new ServiceException("Método de pago no válido: " + request.getMetodoPago());
            }
            
            BigDecimal subtotalSinDescuento = request.getTotalPedido();
            BigDecimal descuentoAplicado = BigDecimal.ZERO;
            
            if (request.getCodigoCupon() != null && !request.getCodigoCupon().trim().isEmpty()) {
                String codigoCupon = request.getCodigoCupon().trim().toUpperCase();
                
                if (!cuponService.validarCupon(codigoCupon, cliente.getIdUsuario(), subtotalSinDescuento)) {
                    throw new ServiceException("El cupón no es válido o no cumple con los requisitos");
                }
                
                com.web.capas.domain.dto.CuponResponse cupon = cuponService.obtenerCuponPorCodigo(codigoCupon);
                
                if ("porcentaje".equals(cupon.getTipoDescuento())) {
                    descuentoAplicado = subtotalSinDescuento.multiply(cupon.getValorDescuento())
                        .divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
                } else if ("monto_fijo".equals(cupon.getTipoDescuento())) {
                    descuentoAplicado = cupon.getValorDescuento();
                    if (descuentoAplicado.compareTo(subtotalSinDescuento) > 0) {
                        descuentoAplicado = subtotalSinDescuento;
                    }
                }
                
                if (cupon.getCantidadDisponible() != null && cupon.getCantidadDisponible() > 0) {
                    com.web.capas.infrastructure.persistence.entities.Cupon cuponEntity = 
                        cuponRepository.findById(cupon.getIdCupon())
                            .orElse(null);
                    if (cuponEntity != null) {
                        cuponEntity.setCantidadDisponible(cupon.getCantidadDisponible() - 1);
                        cuponRepository.save(cuponEntity);
                    }
                }
            }
            
            BigDecimal totalConDescuento = subtotalSinDescuento.subtract(descuentoAplicado);
            if (totalConDescuento.compareTo(BigDecimal.ZERO) < 0) {
                totalConDescuento = BigDecimal.ZERO;
            }
            
            Pedido pedido = new Pedido();
            pedido.setCliente(cliente);
            pedido.setFechaPedido(LocalDateTime.now());
            pedido.setEstadoPedido(Pedido.EstadoPedido.pendiente);
            pedido.setTotalPedido(totalConDescuento);
            pedido.setDescuentoAplicado(descuentoAplicado);
            
            if (request.getCodigoCupon() != null && !request.getCodigoCupon().trim().isEmpty()) {
                pedido.setCodigoCupon(request.getCodigoCupon().trim().toUpperCase());
            }
            
            if ("efectivo".equals(request.getMetodoPago()) && request.getMontoPagadoCliente() != null) {
                pedido.setMontoPagadoCliente(request.getMontoPagadoCliente());
            }
            pedido.setDireccionEntrega(request.getDireccionEntrega());
            pedido.setNotasCliente(request.getNotasCliente());
            
            try {
                pedido.setMetodoPago(Pedido.MetodoPago.valueOf(request.getMetodoPago()));
            } catch (IllegalArgumentException e) {
                throw new ServiceException("Método de pago no válido: " + request.getMetodoPago());
            }
            
            if (request.getMetodoPago().equals("tarjeta")) {
                pedido.setEstadoPago(Pedido.EstadoPago.pendiente);
            } else {
                pedido.setEstadoPago(Pedido.EstadoPago.pendiente);
            }
            
            Pedido pedidoGuardado = pedidoRepository.save(pedido);
            
            for (ProductoPedidoRequest productoRequest : request.getProductos()) {
                Producto producto = productoRepository.findById(productoRequest.getIdProducto())
                    .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado: " + productoRequest.getIdProducto()));

                int cantidadSolicitada = productoRequest.getCantidad();
                int stockDisponible = producto.getStock() != null ? producto.getStock() : 0;

                if (stockDisponible < cantidadSolicitada) {
                    throw new ServiceException("Stock insuficiente para el producto: " + producto.getNombre());
                }

                producto.setStock(stockDisponible - cantidadSolicitada);
                productoRepository.save(producto);
                
                DetallePedido detalle = new DetallePedido();
                detalle.setPedido(pedidoGuardado);
                detalle.setProducto(producto);
                detalle.setCantidad(productoRequest.getCantidad());
                detalle.setPrecioUnitario(productoRequest.getPrecioUnitario());
                detalle.setSubtotal(productoRequest.getSubtotal());
                detalle.setNotasPersonalizacion(productoRequest.getNotasPersonalizacion());
                
                detallePedidoRepository.save(detalle);
            }
            
            if (!request.getMetodoPago().equals("tarjeta")) {
                try {
                    Pago pago = new Pago();
                    pago.setPedido(pedidoGuardado);
                    pago.setMonto(totalConDescuento);
                    
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
                    
                    pagoGuardado.setEstadoTransaccion(Pago.EstadoTransaccion.exitoso);
                    pagoRepository.save(pagoGuardado);
                    
                    pedidoGuardado.setEstadoPago(Pedido.EstadoPago.pagado);
                    pedidoRepository.save(pedidoGuardado);
                    
                    try {
                        String telefono = pedidoGuardado.getCliente().getTelefono();
                        String nombreCliente = pedidoGuardado.getCliente().getNombre();
                        
                        if (telefono != null && !telefono.trim().isEmpty()) {
                            whatsAppService.notificarPedidoConfirmado(telefono, pedidoGuardado.getIdPedido(), nombreCliente);
                        }
                    } catch (Exception e) {
                        System.err.println("Error al enviar WhatsApp de confirmación: " + e.getMessage());
                    }
                    
                } catch (Exception e) {
                    System.err.println("Error al crear registro de pago: " + e.getMessage());
                    throw new ServiceException("Error al crear registro de pago: " + e.getMessage(), e);
                }
            }
            
            try {
                List<Usuario> repartidores = usuarioRepository.findByRolAndActivoTrueAndPlayerIdIsNotNull(Usuario.Rol.repartidor);
                
                if (!repartidores.isEmpty()) {
                    List<String> playerIds = repartidores.stream()
                        .map(Usuario::getPlayerId)
                        .filter(playerId -> playerId != null && !playerId.trim().isEmpty())
                        .collect(Collectors.toList());
                    
                    if (!playerIds.isEmpty()) {
                        String titulo = "Nuevo Pedido";
                        String mensaje = String.format(
                            "Tienes un nuevo pedido #%d. Dirección: %s",
                            pedidoGuardado.getIdPedido(),
                            pedidoGuardado.getDireccionEntrega()
                        );
                        
                        Map<String, Object> datos = new HashMap<>();
                        datos.put("pedidoId", pedidoGuardado.getIdPedido());
                        datos.put("tipo", "nuevo_pedido");
                        
                        oneSignalSender.enviarNotificacion(playerIds, titulo, mensaje, datos);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error al enviar notificación push: " + e.getMessage());
            }
            
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
    public PedidoResponse obtenerPedidoPorIdComoDTO(Integer idPedido) {
        Pedido pedido = obtenerPedidoPorId(idPedido);
        return convertirAPedidoResponse(pedido);
    }
    
    private PedidoResponse convertirAPedidoResponse(Pedido pedido) {
        PedidoResponse response = new PedidoResponse();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        response.setIdPedido(pedido.getIdPedido());
        response.setTotalPedido(pedido.getTotalPedido());
        response.setDireccionEntrega(pedido.getDireccionEntrega());
        response.setMetodoPago(pedido.getMetodoPago() != null ? pedido.getMetodoPago().toString() : null);
        response.setEstadoPago(pedido.getEstadoPago() != null ? pedido.getEstadoPago().toString() : null);
        response.setEstadoPedido(pedido.getEstadoPedido() != null ? pedido.getEstadoPedido().toString() : null);
        response.setFechaPedido(pedido.getFechaPedido() != null ? pedido.getFechaPedido().format(formatter) : null);
        
        return response;
    }

    @Override
    public List<Pedido> obtenerPedidosDelUsuario(Integer idUsuario) {
        try {
            // Filtrar pedidos por el ID del usuario 
            List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuarioOrderByFechaPedidoDesc(idUsuario);
            return pedidos;
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            throw new ServiceException("Error al obtener pedidos del usuario", e);
        }
    }

    @Override
    public List<PedidoListaResponse> obtenerPedidosDelUsuarioComoDTO(Integer idUsuario) {
        try {
            List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuarioOrderByFechaPedidoDesc(idUsuario);
            
            return pedidos.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            throw new ServiceException("Error al obtener pedidos del usuario", e);
        }
    }

    private PedidoListaResponse convertirAPedidoListaResponse(Pedido pedido) {
        PedidoListaResponse response = new PedidoListaResponse();
        
        response.setIdPedido(pedido.getIdPedido());
        response.setFechaPedido(pedido.getFechaPedido().toString());
        response.setEstadoPedido(pedido.getEstadoPedido().toString());
        response.setTotalPedido(pedido.getTotalPedido());
        response.setDireccionEntrega(pedido.getDireccionEntrega());
        response.setNotasCliente(pedido.getNotasCliente());
        response.setMetodoPago(pedido.getMetodoPago().toString());
        response.setEstadoPago(pedido.getEstadoPago().toString());
        response.setFechaEntrega(pedido.getFechaEntrega() != null ? pedido.getFechaEntrega().toString() : null);
        response.setProblemaReportado(pedido.getProblemaReportado());
        response.setDetalleProblema(pedido.getDetalleProblema());
        response.setFechaProblema(pedido.getFechaProblema() != null ? pedido.getFechaProblema().toString() : null);
        
        response.setPagoEfectivoConfirmadoPorCliente(pedido.getPagoEfectivoConfirmadoPorCliente());
        response.setPagoEfectivoConfirmadoPorRepartidor(pedido.getPagoEfectivoConfirmadoPorRepartidor());
        response.setFechaConfirmacionPagoCliente(pedido.getFechaConfirmacionPagoCliente() != null ? pedido.getFechaConfirmacionPagoCliente().toString() : null);
        response.setFechaConfirmacionPagoRepartidor(pedido.getFechaConfirmacionPagoRepartidor() != null ? pedido.getFechaConfirmacionPagoRepartidor().toString() : null);
        
        response.setMontoPagadoCliente(pedido.getMontoPagadoCliente());
        
        response.setCodigoCupon(pedido.getCodigoCupon());
        
        if (pedido.getCliente() != null) {
            ClienteResponse cliente = new ClienteResponse(
                pedido.getCliente().getIdUsuario(),
                pedido.getCliente().getNombre(),
                pedido.getCliente().getApellido(),
                pedido.getCliente().getTelefono()
            );
            response.setCliente(cliente);
        }
        
        if (pedido.getRepartidor() != null) {
            RepartidorResponse repartidor = new RepartidorResponse(
                pedido.getRepartidor().getIdUsuario(),
                pedido.getRepartidor().getNombre(),
                pedido.getRepartidor().getApellido(),
                pedido.getRepartidor().getTelefono()
            );
            response.setRepartidor(repartidor);
        }
        
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
                    
                    if (detalle.getProducto() != null) {
                        producto.setNombre(detalle.getProducto().getNombre());
                        producto.setDescripcion(detalle.getProducto().getDescripcion());
                        producto.setImagenUrl(detalle.getProducto().getImagenUrl());
                        producto.setCategoria(detalle.getProducto().getCategoria().getNombre());
                    } else {
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

    @Override
    public List<PedidoListaResponse> obtenerPedidosDisponibles() {
        try {
            List<Pedido.EstadoPedido> estados = java.util.Arrays.asList(
                Pedido.EstadoPedido.pendiente,
                Pedido.EstadoPedido.aceptado,
                Pedido.EstadoPedido.en_preparacion
            );
            
            List<Pedido> pedidos = pedidoRepository.findByRepartidorIsNullAndEstadoPedidoIn(estados);
            
            return pedidos.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos disponibles: " + e.getMessage());
            throw new ServiceException("Error al obtener pedidos disponibles", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse aceptarPedido(Integer idPedido, Integer idRepartidor) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            if (pedido.getRepartidor() != null) {
                throw new ServiceException("Este pedido ya tiene un repartidor asignado");
            }
            
            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.pendiente &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.aceptado && 
                pedido.getEstadoPedido() != Pedido.EstadoPedido.en_preparacion) {
                throw new ServiceException("Este pedido no está disponible para ser aceptado en este momento");
            }
            
            Usuario repartidor = usuarioRepository.findById(idRepartidor)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Repartidor no encontrado"));
            
            if (repartidor.getRol() != Usuario.Rol.repartidor) {
                throw new ServiceException("El usuario no es un repartidor");
            }
            
            pedido.setRepartidor(repartidor);
            pedido.setEstadoPedido(Pedido.EstadoPedido.en_camino);
            
            Pedido pedidoActualizado = pedidoRepository.save(pedido);
            return convertirAPedidoResponse(pedidoActualizado);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al aceptar pedido: " + e.getMessage());
            throw new ServiceException("Error al aceptar el pedido", e);
        }
    }

    @Override
    public List<PedidoListaResponse> obtenerPedidosDelRepartidor(Integer idRepartidor) {
        try {
            List<Pedido> pedidos = pedidoRepository.findByRepartidor_IdUsuario(idRepartidor);
            
            return pedidos.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del repartidor: " + e.getMessage());
            throw new ServiceException("Error al obtener pedidos del repartidor", e);
        }
    }

    @Override
    @Transactional
    public void marcarPedidoComoEntregado(Integer idPedido) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino) {
                throw new ServiceException("El pedido debe estar en curso para ser marcado como entregado");
            }
            
            pedido.setEstadoPedido(Pedido.EstadoPedido.entregado);
            pedido.setFechaEntrega(LocalDateTime.now());
            pedidoRepository.save(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al marcar pedido como entregado: " + e.getMessage());
            throw new ServiceException("Error al marcar el pedido como entregado", e);
        }
    }

    @Override
    public List<PedidoListaResponse> obtenerHistorialEntregas(Integer idRepartidor) {
        try {
            List<Pedido> pedidosEntregados = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoOrderByFechaEntregaDesc(
                idRepartidor, 
                Pedido.EstadoPedido.entregado
            );
            
            return pedidosEntregados.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener historial de entregas: " + e.getMessage());
            throw new ServiceException("Error al obtener historial de entregas", e);
        }
    }

    @Override
    public Map<String, Object> obtenerEstadisticasRepartidor(Integer idRepartidor) {
        try {
            usuarioRepository.findById(idRepartidor)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Repartidor no encontrado"));
            
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime inicioHoy = ahora.toLocalDate().atStartOfDay();
            LocalDateTime finHoy = ahora.toLocalDate().atTime(23, 59, 59);
            
            LocalDate fechaHoy = ahora.toLocalDate();
            LocalDate inicioSemana = fechaHoy.minusDays(fechaHoy.getDayOfWeek().getValue() - 1);
            LocalDateTime inicioSemanaDateTime = inicioSemana.atStartOfDay();
            
            LocalDate inicioMes = fechaHoy.withDayOfMonth(1);
            LocalDateTime inicioMesDateTime = inicioMes.atStartOfDay();
            
            List<Pedido> entregasHoy = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
                idRepartidor, 
                Pedido.EstadoPedido.entregado, 
                inicioHoy, 
                finHoy
            );
            
            List<Pedido> entregasSemana = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
                idRepartidor, 
                Pedido.EstadoPedido.entregado, 
                inicioSemanaDateTime, 
                finHoy
            );
            
            List<Pedido> entregasMes = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
                idRepartidor, 
                Pedido.EstadoPedido.entregado, 
                inicioMesDateTime, 
                finHoy
            );
            
            BigDecimal ganadoHoy = entregasHoy.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal ganadoSemana = entregasSemana.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal ganadoMes = entregasMes.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            List<Pedido> todasLasEntregas = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoOrderByFechaEntregaDesc(
                idRepartidor, 
                Pedido.EstadoPedido.entregado
            );
            
            int totalEntregas = todasLasEntregas.size();
            
            BigDecimal gananciaTotal = todasLasEntregas.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> estadisticas = new HashMap<>();
            estadisticas.put("entregasHoy", entregasHoy.size());
            estadisticas.put("entregasSemana", entregasSemana.size());
            estadisticas.put("entregasMes", entregasMes.size());
            estadisticas.put("ganadoHoy", ganadoHoy.doubleValue());
            estadisticas.put("ganadoSemana", ganadoSemana.doubleValue());
            estadisticas.put("ganadoMes", ganadoMes.doubleValue());
            estadisticas.put("totalEntregas", totalEntregas);
            estadisticas.put("gananciaTotal", gananciaTotal.doubleValue());
            
            return estadisticas;
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al obtener estadísticas del repartidor: " + e.getMessage());
            throw new ServiceException("Error al obtener estadísticas del repartidor", e);
        }
    }

    @Override
    public List<PedidoListaResponse> obtenerHistorialCliente(Integer idCliente, int limite) {
        try {
            int limiteSeguro = limite > 0 ? Math.min(limite, 20) : 10;
            List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuarioOrderByFechaPedidoDesc(
                idCliente,
                PageRequest.of(0, limiteSeguro)
            );
            return pedidos.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener historial del cliente " + idCliente + ": " + e.getMessage());
            throw new ServiceException("Error al obtener historial del cliente", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse cancelarPedidoRepartidor(Integer idPedido, Integer idRepartidor) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

            if (pedido.getRepartidor() == null || !pedido.getRepartidor().getIdUsuario().equals(idRepartidor)) {
                throw new ServiceException("El pedido no está asignado a este repartidor");
            }

            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.aceptado) {
                throw new ServiceException("No se puede cancelar el pedido en su estado actual");
            }

            pedido.setRepartidor(null);
            pedido.setEstadoPedido(Pedido.EstadoPedido.pendiente);
            pedidoRepository.save(pedido);

            return convertirAPedidoResponse(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al cancelar pedido del repartidor: " + e.getMessage());
            throw new ServiceException("Error al cancelar el pedido", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse cancelarPedidoCliente(Integer idPedido, Integer idCliente) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

            // Validar que el pedido pertenece al cliente
            if (pedido.getCliente() == null || !pedido.getCliente().getIdUsuario().equals(idCliente)) {
                throw new ServiceException("El pedido no pertenece a este cliente");
            }

            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.pendiente &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.aceptado &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.en_preparacion) {
                throw new ServiceException("No se puede cancelar el pedido en su estado actual");
            }

            pedido.setEstadoPedido(Pedido.EstadoPedido.cancelado);
            pedidoRepository.save(pedido);

            if (pedido.getCodigoCupon() != null && !pedido.getCodigoCupon().trim().isEmpty()) {
                try {
                    String codigoCupon = pedido.getCodigoCupon().trim().toUpperCase();
                    Optional<com.web.capas.infrastructure.persistence.entities.Cupon> cuponEntity = 
                        cuponRepository.findByCodigo(codigoCupon);
                    if (cuponEntity.isPresent()) {
                        com.web.capas.infrastructure.persistence.entities.Cupon cupon = cuponEntity.get();
                        if (cupon.getCantidadDisponible() != null) {
                            cupon.setCantidadDisponible(cupon.getCantidadDisponible() + 1);
                            cuponRepository.save(cupon);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error al devolver cupón al cancelar pedido: " + e.getMessage());
                }
            }

            // Obtener la fecha de reactivación más reciente
            LocalDateTime fechaDesde = null;
            try {
                MetodoPagoInhabilitado.MetodoPago metodoPagoEnum = MetodoPagoInhabilitado.MetodoPago.valueOf(
                    pedido.getMetodoPago().toString()
                );
                Optional<MetodoPagoInhabilitado> ultimaReactivacion = metodoPagoInhabilitadoRepository
                    .findFirstByUsuarioAndMetodoPagoAndFechaReactivacionIsNotNullOrderByFechaReactivacionDesc(
                        pedido.getCliente(),
                        metodoPagoEnum
                    );
                if (ultimaReactivacion.isPresent() && ultimaReactivacion.get().getFechaReactivacion() != null) {
                    fechaDesde = ultimaReactivacion.get().getFechaReactivacion();
                }
            } catch (Exception e) {

            }
            
            long cancelaciones;
            if (fechaDesde != null) {
                cancelaciones = pedidoRepository.countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedidoAndFechaPedidoAfter(
                    pedido.getCliente().getIdUsuario(),
                    pedido.getMetodoPago(),
                    Pedido.EstadoPedido.cancelado,
                    fechaDesde
                );
            } else {
                cancelaciones = pedidoRepository.countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedido(
                    pedido.getCliente().getIdUsuario(),
                    pedido.getMetodoPago(),
                    Pedido.EstadoPedido.cancelado
                );
            }

            if (cancelaciones >= 3) {
                try {
                    MetodoPagoInhabilitado.MetodoPago metodoPagoEnum = MetodoPagoInhabilitado.MetodoPago.valueOf(
                        pedido.getMetodoPago().toString()
                    );
                    String razon = "Cancelación automática: El cliente ha cancelado 3 o más pedidos con este método de pago";
                    metodoPagoInhabilitadoService.inhabilitarMetodoPago(
                        pedido.getCliente(),
                        metodoPagoEnum,
                        razon
                    );
                    
                    String nombreMetodoPago = obtenerNombreMetodoPago(metodoPagoEnum);
                    
                    if (pedido.getCliente().getPlayerId() != null && !pedido.getCliente().getPlayerId().trim().isEmpty()) {
                        String titulo = "Método de Pago Inhabilitado";
                        String mensaje = String.format(
                            "Tu método de pago %s ha sido inhabilitado temporalmente debido a múltiples cancelaciones. Por favor, contacta al administrador para más información.",
                            nombreMetodoPago
                        );
                        
                        Map<String, Object> datos = new HashMap<>();
                        datos.put("tipo", "metodo_pago_inhabilitado");
                        datos.put("metodoPago", metodoPagoEnum.toString());
                        
                        oneSignalSender.enviarNotificacion(
                            List.of(pedido.getCliente().getPlayerId()),
                            titulo,
                            mensaje,
                            datos
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Error al inhabilitar método de pago: " + e.getMessage());
                }
            }

            return convertirAPedidoResponse(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al cancelar pedido del cliente: " + e.getMessage());
            throw new ServiceException("Error al cancelar el pedido", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse reportarProblema(Integer idPedido, Integer idRepartidor, String descripcion) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

            if (pedido.getRepartidor() == null || !pedido.getRepartidor().getIdUsuario().equals(idRepartidor)) {
                throw new ServiceException("El pedido no está asignado a este repartidor");
            }

            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.entregado) {
                throw new ServiceException("Solo puedes reportar problemas de pedidos en curso o entregados");
            }

            pedido.setProblemaReportado(Boolean.TRUE);
            pedido.setDetalleProblema(descripcion);
            pedido.setFechaProblema(LocalDateTime.now());
            pedidoRepository.save(pedido);

            return convertirAPedidoResponse(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al reportar problema: " + e.getMessage());
            throw new ServiceException("Error al reportar el problema", e);
        }
    }

    @Override
    public List<ReporteProblemaResponse> obtenerReportesProblemas() {
        try {
            List<Pedido> pedidos = pedidoRepository.findByProblemaReportadoTrueOrderByFechaProblemaDesc();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return pedidos.stream().map(pedido -> {
                ReporteProblemaResponse response = new ReporteProblemaResponse();
                response.setIdPedido(pedido.getIdPedido());
                if (pedido.getCliente() != null) {
                    String nombre = pedido.getCliente().getNombre() != null ? pedido.getCliente().getNombre() : "";
                    String apellido = pedido.getCliente().getApellido() != null ? pedido.getCliente().getApellido() : "";
                    response.setClienteNombre((nombre + " " + apellido).trim());
                    response.setClienteTelefono(pedido.getCliente().getTelefono());
                }
                response.setDetalleProblema(pedido.getDetalleProblema());
                response.setEstadoPedido(pedido.getEstadoPedido() != null ? pedido.getEstadoPedido().toString() : null);
                response.setFechaProblema(pedido.getFechaProblema() != null ? pedido.getFechaProblema().format(formatter) : null);
                response.setRepartidorNombre(pedido.getRepartidor() != null ?
                        pedido.getRepartidor().getNombre() + " " + pedido.getRepartidor().getApellido() : null);
                return response;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new ServiceException("Error al obtener los reportes de problemas", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse confirmarPagoEfectivoCliente(Integer idPedido, Integer idCliente) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

            // Validar que el pedido pertenece al cliente
            if (pedido.getCliente() == null || !pedido.getCliente().getIdUsuario().equals(idCliente)) {
                throw new ServiceException("El pedido no pertenece a este cliente");
            }

            // Validar que el método de pago es efectivo
            if (pedido.getMetodoPago() != Pedido.MetodoPago.efectivo) {
                throw new ServiceException("Este pedido no fue pagado con efectivo");
            }

            // Validar que el pedido está entregado o en camino
            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.entregado &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino) {
                throw new ServiceException("Solo se puede confirmar el pago cuando el pedido está entregado o en camino");
            }

            // Confirmar pago
            pedido.setPagoEfectivoConfirmadoPorCliente(Boolean.TRUE);
            pedido.setFechaConfirmacionPagoCliente(LocalDateTime.now());
            pedidoRepository.save(pedido);

            return convertirAPedidoResponse(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al confirmar pago del cliente: " + e.getMessage());
            throw new ServiceException("Error al confirmar el pago", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse confirmarPagoEfectivoRepartidor(Integer idPedido, Integer idRepartidor) {
        try {
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));

            if (pedido.getRepartidor() == null || !pedido.getRepartidor().getIdUsuario().equals(idRepartidor)) {
                throw new ServiceException("El pedido no está asignado a este repartidor");
            }

            if (pedido.getMetodoPago() != Pedido.MetodoPago.efectivo) {
                throw new ServiceException("Este pedido no fue pagado con efectivo");
            }

            // Validar que el pedido está entregado o en camino
            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.entregado &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino) {
                throw new ServiceException("Solo se puede confirmar el pago cuando el pedido está entregado o en camino");
            }

            pedido.setPagoEfectivoConfirmadoPorRepartidor(Boolean.TRUE);
            pedido.setFechaConfirmacionPagoRepartidor(LocalDateTime.now());
            pedidoRepository.save(pedido);

            return convertirAPedidoResponse(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al confirmar pago del repartidor: " + e.getMessage());
            throw new ServiceException("Error al confirmar el pago", e);
        }
    }

    @Override
    public long contarCancelacionesPorMetodoPago(Integer idCliente, String metodoPago) {
        try {
            Pedido.MetodoPago metodoPagoEnum = Pedido.MetodoPago.valueOf(metodoPago);
            
            // Obtener el usuario
            Usuario usuario = usuarioRepository.findById(idCliente)
                .orElse(null);
            if (usuario == null) {
                return 0;
            }
            
            // Obtener la fecha de reactivación más reciente
            LocalDateTime fechaDesde = null;
            try {
                MetodoPagoInhabilitado.MetodoPago metodoPagoInhabilitadoEnum = MetodoPagoInhabilitado.MetodoPago.valueOf(metodoPago);
                Optional<MetodoPagoInhabilitado> ultimaReactivacion = metodoPagoInhabilitadoRepository
                    .findFirstByUsuarioAndMetodoPagoAndFechaReactivacionIsNotNullOrderByFechaReactivacionDesc(
                        usuario,
                        metodoPagoInhabilitadoEnum
                    );
                if (ultimaReactivacion.isPresent() && ultimaReactivacion.get().getFechaReactivacion() != null) {
                    fechaDesde = ultimaReactivacion.get().getFechaReactivacion();
                }
            } catch (Exception e) {

            }
            
            if (fechaDesde != null) {
                return pedidoRepository.countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedidoAndFechaPedidoAfter(
                    idCliente,
                    metodoPagoEnum,
                    Pedido.EstadoPedido.cancelado,
                    fechaDesde
                );
            } else {
                return pedidoRepository.countByCliente_IdUsuarioAndMetodoPagoAndEstadoPedido(
                    idCliente,
                    metodoPagoEnum,
                    Pedido.EstadoPedido.cancelado
                );
            }
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }

    private String obtenerNombreMetodoPago(MetodoPagoInhabilitado.MetodoPago metodoPago) {
        switch (metodoPago) {
            case tarjeta:
                return "Tarjeta de Crédito/Débito";
            case billetera_virtual:
                return "Billetera Virtual";
            case efectivo:
                return "Efectivo";
            default:
                return metodoPago.toString();
        }
    }
}
