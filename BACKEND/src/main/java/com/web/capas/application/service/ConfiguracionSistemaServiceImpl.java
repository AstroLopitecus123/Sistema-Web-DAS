package com.web.capas.application.service;

import com.web.capas.domain.repository.ConfiguracionSistemaRepository;
import com.web.capas.infrastructure.persistence.entities.ConfiguracionSistema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class ConfiguracionSistemaServiceImpl implements ConfiguracionSistemaService {

    private static final String CLAVE_PORCENTAJE_COSTO = "reporte.porcentaje.costo";
    private static final BigDecimal PORCENTAJE_DEFAULT = new BigDecimal("0.70");

    @Autowired
    private ConfiguracionSistemaRepository configuracionRepository;

    @Override
    public BigDecimal obtenerPorcentajeCosto() {
        try {
            Optional<ConfiguracionSistema> config = configuracionRepository.findByClave(CLAVE_PORCENTAJE_COSTO);
            
            if (config.isPresent()) {
                try {
                    return new BigDecimal(config.get().getValor());
                } catch (NumberFormatException e) {
                    return PORCENTAJE_DEFAULT;
                }
            }
            
            ConfiguracionSistema nuevaConfig = new ConfiguracionSistema();
            nuevaConfig.setClave(CLAVE_PORCENTAJE_COSTO);
            nuevaConfig.setValor(PORCENTAJE_DEFAULT.toString());
            nuevaConfig.setDescripcion("Porcentaje de costo estimado para reportes de ganancias (0.70 = 70%)");
            configuracionRepository.save(nuevaConfig);
            
            return PORCENTAJE_DEFAULT;
        } catch (Exception e) {
            throw new RuntimeException("Error al acceder a la configuración en la base de datos", e);
        }
    }

    @Override
    @Transactional
    public void actualizarPorcentajeCosto(BigDecimal porcentaje) {
        if (porcentaje == null) {
            throw new IllegalArgumentException("El porcentaje no puede ser nulo");
        }
        
        if (porcentaje.compareTo(BigDecimal.ZERO) < 0 || porcentaje.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("El porcentaje debe estar entre 0 y 1");
        }

        try {
            Optional<ConfiguracionSistema> config = configuracionRepository.findByClave(CLAVE_PORCENTAJE_COSTO);
            
            if (config.isPresent()) {
                config.get().setValor(porcentaje.toString());
                configuracionRepository.save(config.get());
            } else {
                ConfiguracionSistema nuevaConfig = new ConfiguracionSistema();
                nuevaConfig.setClave(CLAVE_PORCENTAJE_COSTO);
                nuevaConfig.setValor(porcentaje.toString());
                nuevaConfig.setDescripcion("Porcentaje de costo estimado para reportes de ganancias");
                configuracionRepository.save(nuevaConfig);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar la configuración en la base de datos", e);
        }
    }
}

