package com.web.capas.application.service;

import com.web.capas.domain.dto.ReporteResponse;
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.domain.repository.ReporteRepository;
import com.web.capas.infrastructure.persistence.entities.*;
import com.web.capas.domain.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private ConfiguracionSistemaService configuracionSistemaService;

    @Override
    @Transactional
    public ReporteResponse generarReporteVentas(Usuario admin, LocalDate fechaInicio, LocalDate fechaFin) {
        try {
            if (fechaInicio != null && fechaFin != null && fechaInicio.isAfter(fechaFin)) {
                throw new ServiceException("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            
            List<Pedido> pedidos = obtenerPedidosEnRango(fechaInicio, fechaFin);
            
            // Filtrar solo pedidos entregados y pagados
            List<Pedido> pedidosVendidos = pedidos.stream()
                .filter(p -> p.getEstadoPedido() == Pedido.EstadoPedido.entregado 
                          && p.getEstadoPago() == Pedido.EstadoPago.pagado)
                .collect(Collectors.toList());
            
            // Calcular totales
            BigDecimal totalVentas = pedidosVendidos.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            int cantidadPedidos = pedidosVendidos.size();
            
            // Guardar registro del reporte
            Reporte reporte = new Reporte();
            reporte.setNombreReporte("Reporte de Ventas");
            reporte.setTipoReporte(Reporte.TipoReporte.ventas);
            reporte.setFechaGeneracion(LocalDateTime.now());
            reporte.setGeneradoPorAdmin(admin);
            reporte.setFechaInicioParam(fechaInicio);
            reporte.setFechaFinParam(fechaFin);
            reporteRepository.save(reporte);
            
            // Construir respuesta
            ReporteResponse response = new ReporteResponse();
            response.setIdReporte(reporte.getIdReporte());
            response.setTipoReporte("ventas");
            response.setNombreReporte("Reporte de Ventas");
            response.setFechaGeneracion(reporte.getFechaGeneracion());
            response.setFechaInicio(fechaInicio);
            response.setFechaFin(fechaFin);
            
            Map<String, Object> datos = new HashMap<>();
            datos.put("totalVentas", totalVentas);
            datos.put("cantidadPedidos", cantidadPedidos);
            datos.put("promedioVenta", cantidadPedidos > 0 ? totalVentas.divide(new BigDecimal(cantidadPedidos), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
            
            // Ventas por día
            Map<String, BigDecimal> ventasPorDia = pedidosVendidos.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getFechaPedido().toLocalDate().toString(),
                    Collectors.reducing(BigDecimal.ZERO, Pedido::getTotalPedido, BigDecimal::add)
                ));
            datos.put("ventasPorDia", ventasPorDia);
            
            response.setDatos(datos);
            
            return response;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al generar reporte de ventas", e);
        }
    }

    @Override
    @Transactional
    public ReporteResponse generarReporteProductosVendidos(Usuario admin, LocalDate fechaInicio, LocalDate fechaFin) {
        try {
            if (fechaInicio != null && fechaFin != null && fechaInicio.isAfter(fechaFin)) {
                throw new ServiceException("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            
            List<Pedido> pedidos = obtenerPedidosEnRango(fechaInicio, fechaFin);
            
            List<Pedido> pedidosEntregados = pedidos.stream()
                .filter(p -> p.getEstadoPedido() == Pedido.EstadoPedido.entregado)
                .collect(Collectors.toList());
            
            Map<Integer, ProductoVendidoInfo> productosVendidos = new HashMap<>();
            
            for (Pedido pedido : pedidosEntregados) {
                if (pedido.getProductos() != null) {
                    for (DetallePedido detalle : pedido.getProductos()) {
                        Integer idProducto = detalle.getProducto().getIdProducto();
                        ProductoVendidoInfo info = productosVendidos.getOrDefault(idProducto, 
                            new ProductoVendidoInfo(detalle.getProducto().getNombre(), 0, BigDecimal.ZERO));
                        
                        info.cantidad += detalle.getCantidad();
                        info.totalVentas = info.totalVentas.add(detalle.getSubtotal());
                        productosVendidos.put(idProducto, info);
                    }
                }
            }
            
            // Ordenar por cantidad vendida 
            List<Map<String, Object>> productosOrdenados = productosVendidos.entrySet().stream()
                .sorted((e1, e2) -> Integer.compare(e2.getValue().cantidad, e1.getValue().cantidad))
                .map(entry -> {
                    Map<String, Object> producto = new HashMap<>();
                    producto.put("idProducto", entry.getKey());
                    producto.put("nombre", entry.getValue().nombre);
                    producto.put("cantidadVendida", entry.getValue().cantidad);
                    producto.put("totalVentas", entry.getValue().totalVentas);
                    return producto;
                })
                .collect(Collectors.toList());
            
            // Guardar registro del reporte
            Reporte reporte = new Reporte();
            reporte.setNombreReporte("Reporte de Productos Más Vendidos");
            reporte.setTipoReporte(Reporte.TipoReporte.productos_vendidos);
            reporte.setFechaGeneracion(LocalDateTime.now());
            reporte.setGeneradoPorAdmin(admin);
            reporte.setFechaInicioParam(fechaInicio);
            reporte.setFechaFinParam(fechaFin);
            reporteRepository.save(reporte);
            
            // Construir respuesta
            ReporteResponse response = new ReporteResponse();
            response.setIdReporte(reporte.getIdReporte());
            response.setTipoReporte("productos_vendidos");
            response.setNombreReporte("Reporte de Productos Más Vendidos");
            response.setFechaGeneracion(reporte.getFechaGeneracion());
            response.setFechaInicio(fechaInicio);
            response.setFechaFin(fechaFin);
            
            Map<String, Object> datos = new HashMap<>();
            datos.put("productos", productosOrdenados);
            datos.put("totalProductos", productosOrdenados.size());
            response.setDatos(datos);
            
            return response;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al generar reporte de productos vendidos", e);
        }
    }

    @Override
    @Transactional
    public ReporteResponse generarReporteGanancias(Usuario admin, LocalDate fechaInicio, LocalDate fechaFin) {
        try {
            if (fechaInicio != null && fechaFin != null && fechaInicio.isAfter(fechaFin)) {
                throw new ServiceException("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            
            List<Pedido> pedidos = obtenerPedidosEnRango(fechaInicio, fechaFin);
            
            // Filtrar solo pedidos entregados y pagados
            List<Pedido> pedidosPagados = pedidos.stream()
                .filter(p -> p.getEstadoPedido() == Pedido.EstadoPedido.entregado 
                          && p.getEstadoPago() == Pedido.EstadoPago.pagado)
                .collect(Collectors.toList());
            
            // Calcular ganancias totales
            BigDecimal totalGanancias = pedidosPagados.stream()
                .map(Pedido::getTotalPedido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal porcentajeCosto = configuracionSistemaService.obtenerPorcentajeCosto();
            BigDecimal costoEstimado = totalGanancias.multiply(porcentajeCosto);
            BigDecimal gananciaNeta = totalGanancias.subtract(costoEstimado);
            
            // Guardar registro del reporte
            Reporte reporte = new Reporte();
            reporte.setNombreReporte("Reporte de Ganancias");
            reporte.setTipoReporte(Reporte.TipoReporte.ganancias);
            reporte.setFechaGeneracion(LocalDateTime.now());
            reporte.setGeneradoPorAdmin(admin);
            reporte.setFechaInicioParam(fechaInicio);
            reporte.setFechaFinParam(fechaFin);
            reporteRepository.save(reporte);
            
            // Construir respuesta
            ReporteResponse response = new ReporteResponse();
            response.setIdReporte(reporte.getIdReporte());
            response.setTipoReporte("ganancias");
            response.setNombreReporte("Reporte de Ganancias");
            response.setFechaGeneracion(reporte.getFechaGeneracion());
            response.setFechaInicio(fechaInicio);
            response.setFechaFin(fechaFin);
            
            Map<String, Object> datos = new HashMap<>();
            datos.put("totalGanancias", totalGanancias);
            datos.put("costoEstimado", costoEstimado);
            datos.put("gananciaNeta", gananciaNeta);
            datos.put("margenGanancia", totalGanancias.compareTo(BigDecimal.ZERO) > 0 
                ? gananciaNeta.divide(totalGanancias, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO);
            datos.put("cantidadPedidos", pedidosPagados.size());
            
            response.setDatos(datos);
            
            return response;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al generar reporte de ganancias", e);
        }
    }

    @Override
    public List<Reporte> obtenerTodosLosReportes() {
        return reporteRepository.findAllByOrderByFechaGeneracionDesc();
    }

    @Override
    public List<Reporte> obtenerReportesPorTipo(Reporte.TipoReporte tipoReporte) {
        return reporteRepository.findByTipoReporteOrderByFechaGeneracionDesc(tipoReporte);
    }

    private List<Pedido> obtenerPedidosEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Pedido> todosLosPedidos = pedidoRepository.findAll();
        
        if (fechaInicio == null && fechaFin == null) {
            return todosLosPedidos;
        }
        
        return todosLosPedidos.stream()
            .filter(p -> {
                if (p.getFechaPedido() == null) return false;
                LocalDate fechaPedido = p.getFechaPedido().toLocalDate();
                
                boolean cumpleInicio = fechaInicio == null || !fechaPedido.isBefore(fechaInicio);
                boolean cumpleFin = fechaFin == null || !fechaPedido.isAfter(fechaFin);
                
                return cumpleInicio && cumpleFin;
            })
            .collect(Collectors.toList());
    }

    private static class ProductoVendidoInfo {
        String nombre;
        int cantidad;
        BigDecimal totalVentas;

        ProductoVendidoInfo(String nombre, int cantidad, BigDecimal totalVentas) {
            this.nombre = nombre;
            this.cantidad = cantidad;
            this.totalVentas = totalVentas;
        }
    }
}

