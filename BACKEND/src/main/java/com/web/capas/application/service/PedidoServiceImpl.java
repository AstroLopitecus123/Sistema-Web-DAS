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
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.domain.repository.ProductoRepository;
import com.web.capas.domain.repository.DetallePedidoRepository;
import com.web.capas.domain.repository.PagoRepository;
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

                int cantidadSolicitada = productoRequest.getCantidad();
                int stockDisponible = producto.getStock() != null ? producto.getStock() : 0;

                if (stockDisponible < cantidadSolicitada) {
                    throw new ServiceException("Stock insuficiente para el producto: " + producto.getNombre());
                }

                producto.setStock(stockDisponible - cantidadSolicitada);
                productoRepository.save(producto);
                
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
            // Filtrar pedidos por el ID del usuario (cliente)
            List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuario(idUsuario);
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
            
            return pedidos.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener pedidos del usuario " + idUsuario + ": " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al obtener pedidos del usuario", e);
        }
    }

    // Convierte un Pedido a PedidoListaResponse
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
        response.setProblemaReportado(pedido.getProblemaReportado());
        response.setDetalleProblema(pedido.getDetalleProblema());
        response.setFechaProblema(pedido.getFechaProblema() != null ? pedido.getFechaProblema().toString() : null);
        
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

    @Override
    public List<PedidoListaResponse> obtenerPedidosDisponibles() {
        try {
            // Pedidos que están disponibles para ser aceptados por repartidores
            // Estados: pendiente (recién creado), aceptado (restaurante aceptó) o en_preparacion (está listo para recoger)
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
            e.printStackTrace();
            throw new ServiceException("Error al obtener pedidos disponibles", e);
        }
    }

    @Override
    @Transactional
    public PedidoResponse aceptarPedido(Integer idPedido, Integer idRepartidor) {
        try {
            // Validar que el pedido existe
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            // Validar que el pedido no tiene repartidor asignado
            if (pedido.getRepartidor() != null) {
                throw new ServiceException("Este pedido ya tiene un repartidor asignado");
            }
            
            // Validar que el pedido está en un estado que permite asignación
            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.pendiente &&
                pedido.getEstadoPedido() != Pedido.EstadoPedido.aceptado && 
                pedido.getEstadoPedido() != Pedido.EstadoPedido.en_preparacion) {
                throw new ServiceException("Este pedido no está disponible para ser aceptado en este momento");
            }
            
            // Validar que el repartidor existe
            Usuario repartidor = usuarioRepository.findById(idRepartidor)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Repartidor no encontrado"));
            
            // Validar que el usuario es un repartidor
            if (repartidor.getRol() != Usuario.Rol.repartidor) {
                throw new ServiceException("El usuario no es un repartidor");
            }
            
            // Asignar repartidor y cambiar estado a en_camino
            pedido.setRepartidor(repartidor);
            pedido.setEstadoPedido(Pedido.EstadoPedido.en_camino);
            
            // Guardar cambios
            Pedido pedidoActualizado = pedidoRepository.save(pedido);
            
            // Convertir a DTO
            return convertirAPedidoResponse(pedidoActualizado);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al aceptar pedido: " + e.getMessage());
            e.printStackTrace();
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
            e.printStackTrace();
            throw new ServiceException("Error al obtener pedidos del repartidor", e);
        }
    }

    @Override
    @Transactional
    public void marcarPedidoComoEntregado(Integer idPedido) {
        try {
            // Obtener el pedido
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            // Validar que el pedido está en estado en_camino
            if (pedido.getEstadoPedido() != Pedido.EstadoPedido.en_camino) {
                throw new ServiceException("El pedido debe estar en curso para ser marcado como entregado");
            }
            
            // Actualizar estado a entregado y establecer fecha de entrega
            pedido.setEstadoPedido(Pedido.EstadoPedido.entregado);
            pedido.setFechaEntrega(LocalDateTime.now());
            
            // Guardar cambios
            pedidoRepository.save(pedido);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al marcar pedido como entregado: " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al marcar el pedido como entregado", e);
        }
    }

    @Override
    public List<PedidoListaResponse> obtenerHistorialEntregas(Integer idRepartidor) {
        try {
            // Obtener solo pedidos entregados del repartidor, ordenados por fecha de entrega descendente
            List<Pedido> pedidosEntregados = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoOrderByFechaEntregaDesc(
                idRepartidor, 
                Pedido.EstadoPedido.entregado
            );
            
            return pedidosEntregados.stream()
                .map(this::convertirAPedidoListaResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener historial de entregas: " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al obtener historial de entregas", e);
        }
    }

    @Override
    public Map<String, Object> obtenerEstadisticasRepartidor(Integer idRepartidor) {
        try {
            // Validar que el repartidor existe
            usuarioRepository.findById(idRepartidor)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Repartidor no encontrado"));
            
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime inicioHoy = ahora.toLocalDate().atStartOfDay();
            LocalDateTime finHoy = ahora.toLocalDate().atTime(23, 59, 59);
            
            // Inicio de la semana (lunes)
            LocalDate fechaHoy = ahora.toLocalDate();
            LocalDate inicioSemana = fechaHoy.minusDays(fechaHoy.getDayOfWeek().getValue() - 1);
            LocalDateTime inicioSemanaDateTime = inicioSemana.atStartOfDay();
            
            // Inicio del mes
            LocalDate inicioMes = fechaHoy.withDayOfMonth(1);
            LocalDateTime inicioMesDateTime = inicioMes.atStartOfDay();
            
            // Pedidos entregados HOY
            List<Pedido> entregasHoy = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
                idRepartidor, 
                Pedido.EstadoPedido.entregado, 
                inicioHoy, 
                finHoy
            );
            
            // Pedidos entregados ESTA SEMANA
            List<Pedido> entregasSemana = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
                idRepartidor, 
                Pedido.EstadoPedido.entregado, 
                inicioSemanaDateTime, 
                finHoy
            );
            
            // Pedidos entregados ESTE MES
            List<Pedido> entregasMes = pedidoRepository.findByRepartidor_IdUsuarioAndEstadoPedidoAndFechaEntregaBetween(
                idRepartidor, 
                Pedido.EstadoPedido.entregado, 
                inicioMesDateTime, 
                finHoy
            );
            
            // Calcular ganado HOY
            BigDecimal ganadoHoy = entregasHoy.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calcular ganado ESTA SEMANA
            BigDecimal ganadoSemana = entregasSemana.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calcular ganado ESTE MES
            BigDecimal ganadoMes = entregasMes.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> estadisticas = new HashMap<>();
            estadisticas.put("entregasHoy", entregasHoy.size());
            estadisticas.put("entregasSemana", entregasSemana.size());
            estadisticas.put("entregasMes", entregasMes.size());
            estadisticas.put("ganadoHoy", ganadoHoy.doubleValue());
            estadisticas.put("ganadoSemana", ganadoSemana.doubleValue());
            estadisticas.put("ganadoMes", ganadoMes.doubleValue());
            
            return estadisticas;
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al obtener estadísticas del repartidor: " + e.getMessage());
            e.printStackTrace();
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
}
