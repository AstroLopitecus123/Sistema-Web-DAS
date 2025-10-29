package com.web.capas.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Excepción cuando las credenciales de login son inválidas
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class CredencialesInvalidasException extends RuntimeException {
    
    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}
