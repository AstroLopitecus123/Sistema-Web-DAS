package com.web.capas.application.service;

import com.web.capas.infrastructure.persistence.entities.MetodoPagoInhabilitado;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import java.util.List;

public interface MetodoPagoInhabilitadoService {
    
    boolean estaInhabilitado(Usuario usuario, MetodoPagoInhabilitado.MetodoPago metodoPago);
    
    MetodoPagoInhabilitado inhabilitarMetodoPago(Usuario usuario, MetodoPagoInhabilitado.MetodoPago metodoPago, String razon);
    
    MetodoPagoInhabilitado reactivarMetodoPago(Integer idInhabilitacion, Usuario admin);
    
    List<MetodoPagoInhabilitado> obtenerInhabilitacionesActivas();
    
    List<MetodoPagoInhabilitado> obtenerInhabilitacionesPorUsuario(Usuario usuario);
}

