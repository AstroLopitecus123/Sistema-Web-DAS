package com.web.capas.application.service;

import com.web.capas.domain.repository.MetodoPagoInhabilitadoRepository;
import com.web.capas.infrastructure.persistence.entities.MetodoPagoInhabilitado;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MetodoPagoInhabilitadoServiceImpl implements MetodoPagoInhabilitadoService {

    @Autowired
    private MetodoPagoInhabilitadoRepository metodoPagoInhabilitadoRepository;

    @Override
    public boolean estaInhabilitado(Usuario usuario, MetodoPagoInhabilitado.MetodoPago metodoPago) {
        return metodoPagoInhabilitadoRepository
            .findByUsuarioAndMetodoPagoAndActivoTrue(usuario, metodoPago)
            .isPresent();
    }

    @Override
    @Transactional
    public MetodoPagoInhabilitado inhabilitarMetodoPago(Usuario usuario, MetodoPagoInhabilitado.MetodoPago metodoPago, String razon) {
        try {
            MetodoPagoInhabilitado existente = metodoPagoInhabilitadoRepository
                .findByUsuarioAndMetodoPagoAndActivoTrue(usuario, metodoPago)
                .orElse(null);
            
            if (existente != null) {
                existente.setRazon(razon);
                existente.setFechaInhabilitacion(LocalDateTime.now());
                return metodoPagoInhabilitadoRepository.save(existente);
            }
            
            MetodoPagoInhabilitado inhabilitacion = new MetodoPagoInhabilitado();
            inhabilitacion.setUsuario(usuario);
            inhabilitacion.setMetodoPago(metodoPago);
            inhabilitacion.setFechaInhabilitacion(LocalDateTime.now());
            inhabilitacion.setRazon(razon);
            inhabilitacion.setActivo(true);
            
            return metodoPagoInhabilitadoRepository.save(inhabilitacion);
        } catch (Exception e) {
            System.err.println("Error al inhabilitar método de pago: " + e.getMessage());
            throw new ServiceException("Error al inhabilitar método de pago", e);
        }
    }

    @Override
    @Transactional
    public MetodoPagoInhabilitado reactivarMetodoPago(Integer idInhabilitacion, Usuario admin) {
        try {
            MetodoPagoInhabilitado inhabilitacion = metodoPagoInhabilitadoRepository.findById(idInhabilitacion)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Inhabilitación no encontrada"));
            
            inhabilitacion.setActivo(false);
            inhabilitacion.setReactivadoPorAdmin(admin);
            inhabilitacion.setFechaReactivacion(LocalDateTime.now());
            
            return metodoPagoInhabilitadoRepository.save(inhabilitacion);
        } catch (RecursoNoEncontradoExcepcion e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al reactivar método de pago: " + e.getMessage());
            throw new ServiceException("Error al reactivar método de pago", e);
        }
    }

    @Override
    public List<MetodoPagoInhabilitado> obtenerInhabilitacionesActivas() {
        try {
            return metodoPagoInhabilitadoRepository.findAllByOrderByFechaInhabilitacionDesc()
                .stream()
                .filter(MetodoPagoInhabilitado::getActivo)
                .toList();
        } catch (Exception e) {
            System.err.println("Error al obtener inhabilitaciones: " + e.getMessage());
            throw new ServiceException("Error al obtener inhabilitaciones", e);
        }
    }

    @Override
    public List<MetodoPagoInhabilitado> obtenerInhabilitacionesPorUsuario(Usuario usuario) {
        try {
            return metodoPagoInhabilitadoRepository.findByUsuarioAndActivoTrue(usuario);
        } catch (Exception e) {
            System.err.println("Error al obtener inhabilitaciones del usuario: " + e.getMessage());
            throw new ServiceException("Error al obtener inhabilitaciones del usuario", e);
        }
    }
}

