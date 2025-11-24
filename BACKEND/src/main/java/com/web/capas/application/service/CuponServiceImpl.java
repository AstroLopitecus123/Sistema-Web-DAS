package com.web.capas.application.service;

import com.web.capas.domain.dto.CuponRequest;
import com.web.capas.domain.dto.CuponResponse;
import com.web.capas.domain.repository.CuponRepository;
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.infrastructure.persistence.entities.Cupon;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CuponServiceImpl implements CuponService {

    @Autowired
    private CuponRepository cuponRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    @Override
    @Transactional
    public CuponResponse crearCupon(CuponRequest request, Usuario admin) {
        try {
            if (cuponRepository.existsByCodigo(request.getCodigo())) {
                throw new ServiceException("El código del cupón ya existe. Debe ser único.");
            }
            
            if (request.getFechaInicio() != null && request.getFechaFin() != null) {
                if (request.getFechaInicio().isAfter(request.getFechaFin())) {
                    throw new ServiceException("La fecha de inicio no puede ser posterior a la fecha de fin");
                }
                if (request.getFechaInicio().isBefore(LocalDate.now())) {
                    throw new ServiceException("La fecha de inicio no puede ser anterior a la fecha actual");
                }
            }
            
            if (request.getTipoDescuento() != null) {
                if ("porcentaje".equals(request.getTipoDescuento())) {
                    if (request.getValorDescuento() == null || 
                        request.getValorDescuento().compareTo(BigDecimal.ZERO) <= 0 ||
                        request.getValorDescuento().compareTo(new BigDecimal("100")) > 0) {
                        throw new ServiceException("El valor de descuento porcentual debe estar entre 0 y 100");
                    }
                } else if ("monto_fijo".equals(request.getTipoDescuento())) {
                    if (request.getValorDescuento() == null || 
                        request.getValorDescuento().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new ServiceException("El valor de descuento fijo debe ser mayor a 0");
                    }
                } else {
                    throw new ServiceException("Tipo de descuento no válido. Debe ser 'porcentaje' o 'monto_fijo'");
                }
            }
            
            Cupon cupon = new Cupon();
            cupon.setCodigo(request.getCodigo().toUpperCase().trim());
            cupon.setTipoDescuento(Cupon.TipoDescuento.valueOf(request.getTipoDescuento()));
            cupon.setValorDescuento(request.getValorDescuento());
            cupon.setFechaInicio(request.getFechaInicio());
            cupon.setFechaFin(request.getFechaFin());
            cupon.setCantidadDisponible(request.getCantidadDisponible());
            cupon.setUsosMaximosPorUsuario(request.getUsosMaximosPorUsuario());
            cupon.setMontoMinimoCompra(request.getMontoMinimoCompra());
            cupon.setActivo(request.getActivo() != null ? request.getActivo() : true);
            cupon.setFechaCreacion(LocalDateTime.now());
            cupon.setCreadoPorAdmin(admin);
            
            Cupon cuponGuardado = cuponRepository.save(cupon);
            
            return convertirACuponResponse(cuponGuardado);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al crear cupón: " + e.getMessage());
            throw new ServiceException("Error al crear el cupón: " + e.getMessage(), e);
        }
    }

    @Override
    public List<CuponResponse> obtenerTodosLosCupones() {
        try {
            return cuponRepository.findAllByOrderByFechaCreacionDesc()
                .stream()
                .map(this::convertirACuponResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener cupones: " + e.getMessage());
            throw new ServiceException("Error al obtener cupones", e);
        }
    }

    @Override
    public CuponResponse obtenerCuponPorId(Integer idCupon) {
        try {
            Cupon cupon = cuponRepository.findById(idCupon)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cupón no encontrado"));
            return convertirACuponResponse(cupon);
        } catch (RecursoNoEncontradoExcepcion e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al obtener cupón: " + e.getMessage());
            throw new ServiceException("Error al obtener cupón", e);
        }
    }

    @Override
    public CuponResponse obtenerCuponPorCodigo(String codigo) {
        try {
            Cupon cupon = cuponRepository.findByCodigo(codigo.toUpperCase().trim())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cupón no encontrado"));
            return convertirACuponResponse(cupon);
        } catch (RecursoNoEncontradoExcepcion e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al obtener cupón por código: " + e.getMessage());
            throw new ServiceException("Error al obtener cupón por código", e);
        }
    }

    @Override
    @Transactional
    public CuponResponse actualizarCupon(Integer idCupon, CuponRequest request) {
        try {
            Cupon cupon = cuponRepository.findById(idCupon)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cupón no encontrado"));
            
            if (request.getCodigo() != null && !request.getCodigo().equalsIgnoreCase(cupon.getCodigo())) {
                if (cuponRepository.existsByCodigo(request.getCodigo())) {
                    throw new ServiceException("El código del cupón ya existe. Debe ser único.");
                }
                cupon.setCodigo(request.getCodigo().toUpperCase().trim());
            }
            
            if (request.getFechaInicio() != null && request.getFechaFin() != null) {
                if (request.getFechaInicio().isAfter(request.getFechaFin())) {
                    throw new ServiceException("La fecha de inicio no puede ser posterior a la fecha de fin");
                }
            }
            
            if (request.getTipoDescuento() != null) {
                cupon.setTipoDescuento(Cupon.TipoDescuento.valueOf(request.getTipoDescuento()));
            }
            if (request.getValorDescuento() != null) {
                cupon.setValorDescuento(request.getValorDescuento());
            }
            if (request.getFechaInicio() != null) {
                cupon.setFechaInicio(request.getFechaInicio());
            }
            if (request.getFechaFin() != null) {
                cupon.setFechaFin(request.getFechaFin());
            }
            if (request.getCantidadDisponible() != null) {
                cupon.setCantidadDisponible(request.getCantidadDisponible());
            }
            if (request.getUsosMaximosPorUsuario() != null) {
                cupon.setUsosMaximosPorUsuario(request.getUsosMaximosPorUsuario());
            }
            if (request.getMontoMinimoCompra() != null) {
                cupon.setMontoMinimoCompra(request.getMontoMinimoCompra());
            }
            if (request.getActivo() != null) {
                cupon.setActivo(request.getActivo());
            }
            
            Cupon cuponActualizado = cuponRepository.save(cupon);
            return convertirACuponResponse(cuponActualizado);
        } catch (RecursoNoEncontradoExcepcion | ServiceException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al actualizar cupón: " + e.getMessage());
            throw new ServiceException("Error al actualizar cupón", e);
        }
    }

    @Override
    @Transactional
    public CuponResponse cambiarEstadoCupon(Integer idCupon, Boolean activo) {
        try {
            Cupon cupon = cuponRepository.findById(idCupon)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Cupón no encontrado"));
            
            cupon.setActivo(activo);
            Cupon cuponActualizado = cuponRepository.save(cupon);
            
            return convertirACuponResponse(cuponActualizado);
        } catch (RecursoNoEncontradoExcepcion e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al cambiar estado del cupón: " + e.getMessage());
            throw new ServiceException("Error al cambiar estado del cupón", e);
        }
    }

    @Override
    @Transactional
    public boolean eliminarCupon(Integer idCupon) {
        try {
            if (!cuponRepository.existsById(idCupon)) {
                throw new RecursoNoEncontradoExcepcion("Cupón no encontrado");
            }
            cuponRepository.deleteById(idCupon);
            return true;
        } catch (RecursoNoEncontradoExcepcion e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al eliminar cupón: " + e.getMessage());
            throw new ServiceException("Error al eliminar cupón", e);
        }
    }

    @Override
    public boolean validarCupon(String codigo, Integer idUsuario, BigDecimal montoTotal) {
        try {
            Cupon cupon = cuponRepository.findByCodigo(codigo.toUpperCase().trim())
                .orElse(null);
            
            if (cupon == null) {
                return false;
            }
            
            if (!cupon.getActivo()) {
                return false;
            }
            
            LocalDate hoy = LocalDate.now();
            if (cupon.getFechaInicio().isAfter(hoy) || cupon.getFechaFin().isBefore(hoy)) {
                return false;
            }
            
            if (cupon.getMontoMinimoCompra() != null && 
                montoTotal.compareTo(cupon.getMontoMinimoCompra()) < 0) {
                return false;
            }
            
            if (cupon.getCantidadDisponible() != null && cupon.getCantidadDisponible() <= 0) {
                return false;
            }
            
            if (idUsuario != null && cupon.getUsosMaximosPorUsuario() != null) {
                long usosDelUsuario = pedidoRepository.findByCliente_IdUsuario(idUsuario).stream()
                    .filter(p -> cupon.getCodigo().equalsIgnoreCase(p.getCodigoCupon()))
                    .filter(p -> p.getEstadoPedido() != com.web.capas.infrastructure.persistence.entities.Pedido.EstadoPedido.cancelado)
                    .count();
                
                if (usosDelUsuario >= cupon.getUsosMaximosPorUsuario()) {
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error al validar cupón: " + e.getMessage());
            return false;
        }
    }

    @Override
    public List<CuponResponse> obtenerCuponesDisponibles(Integer idUsuario) {
        try {
            LocalDate hoy = LocalDate.now();
            List<Cupon> todosLosCupones = cuponRepository.findByActivoTrueOrderByFechaCreacionDesc();
            
            return todosLosCupones.stream()
                .filter(cupon -> {
                    if (cupon.getFechaInicio().isAfter(hoy) || cupon.getFechaFin().isBefore(hoy)) {
                        return false;
                    }
                    
                    if (cupon.getCantidadDisponible() != null && cupon.getCantidadDisponible() <= 0) {
                        return false;
                    }
                    
                    if (idUsuario != null && cupon.getUsosMaximosPorUsuario() != null) {
                        long usosDelUsuario = pedidoRepository.findByCliente_IdUsuario(idUsuario).stream()
                            .filter(p -> cupon.getCodigo().equalsIgnoreCase(p.getCodigoCupon()))
                            .filter(p -> p.getEstadoPedido() != com.web.capas.infrastructure.persistence.entities.Pedido.EstadoPedido.cancelado)
                            .count();
                        
                        if (usosDelUsuario >= cupon.getUsosMaximosPorUsuario()) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(this::convertirACuponResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener cupones disponibles: " + e.getMessage());
            throw new ServiceException("Error al obtener cupones disponibles", e);
        }
    }

    @Override
    public List<CuponResponse> obtenerCuponesUsados(Integer idUsuario) {
        try {
            List<com.web.capas.infrastructure.persistence.entities.Pedido> pedidosConCupon = 
                pedidoRepository.findByCliente_IdUsuario(idUsuario).stream()
                    .filter(p -> p.getCodigoCupon() != null && !p.getCodigoCupon().trim().isEmpty())
                    .filter(p -> p.getEstadoPedido() != com.web.capas.infrastructure.persistence.entities.Pedido.EstadoPedido.cancelado)
                    .collect(Collectors.toList());
            
            Set<String> codigosCuponesUsados = pedidosConCupon.stream()
                .map(p -> p.getCodigoCupon().toUpperCase().trim())
                .collect(Collectors.toSet());
            
            return codigosCuponesUsados.stream()
                .map(codigo -> cuponRepository.findByCodigo(codigo))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(this::convertirACuponResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener cupones usados: " + e.getMessage());
            throw new ServiceException("Error al obtener cupones usados", e);
        }
    }

    @Override
    public List<CuponResponse> obtenerCuponesExpirados(Integer idUsuario) {
        try {
            LocalDate hoy = LocalDate.now();
            List<Cupon> todosLosCupones = cuponRepository.findAllByOrderByFechaCreacionDesc();
            
            return todosLosCupones.stream()
                .filter(cupon -> {
                    return cupon.getFechaFin().isBefore(hoy);
                })
                .map(this::convertirACuponResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener cupones expirados: " + e.getMessage());
            throw new ServiceException("Error al obtener cupones expirados", e);
        }
    }

    private CuponResponse convertirACuponResponse(Cupon cupon) {
        CuponResponse response = new CuponResponse();
        response.setIdCupon(cupon.getIdCupon());
        response.setCodigo(cupon.getCodigo());
        response.setTipoDescuento(cupon.getTipoDescuento().toString());
        response.setValorDescuento(cupon.getValorDescuento());
        response.setFechaInicio(cupon.getFechaInicio());
        response.setFechaFin(cupon.getFechaFin());
        response.setCantidadDisponible(cupon.getCantidadDisponible());
        response.setUsosMaximosPorUsuario(cupon.getUsosMaximosPorUsuario());
        response.setMontoMinimoCompra(cupon.getMontoMinimoCompra());
        response.setActivo(cupon.getActivo());
        response.setFechaCreacion(cupon.getFechaCreacion());
        response.setCreadoPorAdmin(cupon.getCreadoPorAdmin() != null ? 
            cupon.getCreadoPorAdmin().getNombre() : "N/A");
        return response;
    }
}

