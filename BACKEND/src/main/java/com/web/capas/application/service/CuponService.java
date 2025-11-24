package com.web.capas.application.service;

import com.web.capas.domain.dto.CuponRequest;
import com.web.capas.domain.dto.CuponResponse;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import java.math.BigDecimal;
import java.util.List;

public interface CuponService {
    
    // Crea un nuevo cupón
    CuponResponse crearCupon(CuponRequest request, Usuario admin);
    
    // Obtiene todos los cupones
    List<CuponResponse> obtenerTodosLosCupones();
    
    // Obtiene un cupón por ID
    CuponResponse obtenerCuponPorId(Integer idCupon);
    
    // Obtiene un cupón por código
    CuponResponse obtenerCuponPorCodigo(String codigo);
    
    // Actualiza un cupón
    CuponResponse actualizarCupon(Integer idCupon, CuponRequest request);
    
    // Activa/desactiva un cupón
    CuponResponse cambiarEstadoCupon(Integer idCupon, Boolean activo);
    
    // Elimina un cupón
    boolean eliminarCupon(Integer idCupon);
    
    // Valida un cupón para uso
    boolean validarCupon(String codigo, Integer idUsuario, BigDecimal montoTotal);
    
    // Obtiene cupones disponibles para un cliente
    List<CuponResponse> obtenerCuponesDisponibles(Integer idUsuario);
    
    // Obtiene cupones usados por un cliente
    List<CuponResponse> obtenerCuponesUsados(Integer idUsuario);
    
    // Obtiene cupones expirados para un cliente
    List<CuponResponse> obtenerCuponesExpirados(Integer idUsuario);
}

