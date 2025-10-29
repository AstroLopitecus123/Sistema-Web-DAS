package com.web.capas.domain;

// Excepción cuando no se encuentra un recurso solicitado
public class RecursoNoEncontradoExcepcion extends RuntimeException {
    
    public RecursoNoEncontradoExcepcion(String mensaje) {
        super(mensaje);
    }
}
