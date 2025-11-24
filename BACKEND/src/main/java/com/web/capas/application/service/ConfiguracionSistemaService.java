package com.web.capas.application.service;

import java.math.BigDecimal;

public interface ConfiguracionSistemaService {
    
    BigDecimal obtenerPorcentajeCosto();
    
    void actualizarPorcentajeCosto(BigDecimal porcentaje);
}

