package com.web.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para toda la aplicación
 */
@ControllerAdvice
public class ManejadorGlobalExcepciones {

    private static final Logger logger = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

    /**
     * Maneja excepciones de servicio personalizadas
     */
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionServicio(
            ServiceException ex, 
            WebRequest solicitud) {
        
        Map<String, Object> detallesError = new HashMap<>();
        detallesError.put("marcaTiempo", LocalDateTime.now());
        detallesError.put("estado", HttpStatus.INTERNAL_SERVER_ERROR.value());
        detallesError.put("error", "Error en el servicio");
        detallesError.put("mensaje", ex.getMessage());
        detallesError.put("ruta", solicitud.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(detallesError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Maneja argumentos ilegales (validaciones)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarArgumentoIlegal(
            IllegalArgumentException ex, 
            WebRequest solicitud) {
        
        Map<String, Object> detallesError = new HashMap<>();
        detallesError.put("marcaTiempo", LocalDateTime.now());
        detallesError.put("estado", HttpStatus.BAD_REQUEST.value());
        detallesError.put("error", "Argumento inválido");
        detallesError.put("mensaje", ex.getMessage());
        detallesError.put("ruta", solicitud.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(detallesError, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja recursos no encontrados
     */
    @ExceptionHandler(RecursoNoEncontradoExcepcion.class)
    public ResponseEntity<Map<String, Object>> manejarRecursoNoEncontrado(
            RecursoNoEncontradoExcepcion ex, 
            WebRequest solicitud) {
        
        Map<String, Object> detallesError = new HashMap<>();
        detallesError.put("marcaTiempo", LocalDateTime.now());
        detallesError.put("estado", HttpStatus.NOT_FOUND.value());
        detallesError.put("error", "Recurso no encontrado");
        detallesError.put("mensaje", ex.getMessage());
        detallesError.put("ruta", solicitud.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(detallesError, HttpStatus.NOT_FOUND);
    }

    /**
     * Maneja credenciales inválidas en autenticación
     */
    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, Object>> manejarCredencialesInvalidas(
            CredencialesInvalidasException ex, 
            WebRequest solicitud) {
        
        Map<String, Object> detallesError = new HashMap<>();
        detallesError.put("marcaTiempo", LocalDateTime.now());
        detallesError.put("estado", HttpStatus.UNAUTHORIZED.value());
        detallesError.put("error", "Credenciales inválidas");
        detallesError.put("mensaje", ex.getMessage());
        detallesError.put("ruta", solicitud.getDescription(false).replace("uri=", ""));
        
        return new ResponseEntity<>(detallesError, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Maneja todas las demás excepciones no capturadas
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionGlobal(
            Exception ex, 
            WebRequest solicitud) {
        
        Map<String, Object> detallesError = new HashMap<>();
        detallesError.put("marcaTiempo", LocalDateTime.now());
        detallesError.put("estado", HttpStatus.INTERNAL_SERVER_ERROR.value());
        detallesError.put("error", "Error interno del servidor");
        detallesError.put("mensaje", "Ha ocurrido un error inesperado. Por favor, contacte al administrador.");
        detallesError.put("ruta", solicitud.getDescription(false).replace("uri=", ""));
        
        // Log del error para debugging
        logger.error("Error global capturado: {}", ex.getMessage(), ex);
        
        return new ResponseEntity<>(detallesError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Maneja errores de validación de datos
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionValidacion(
            org.springframework.web.bind.MethodArgumentNotValidException ex,
            WebRequest solicitud) {
        
        Map<String, Object> detallesError = new HashMap<>();
        detallesError.put("marcaTiempo", LocalDateTime.now());
        detallesError.put("estado", HttpStatus.BAD_REQUEST.value());
        detallesError.put("error", "Error de validación");
        detallesError.put("mensaje", "Los datos enviados no son válidos");
        detallesError.put("ruta", solicitud.getDescription(false).replace("uri=", ""));
        
        // Detalles de campos con errores
        Map<String, String> erroresCampos = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            erroresCampos.put(error.getField(), error.getDefaultMessage())
        );
        detallesError.put("erroresCampos", erroresCampos);
        
        return new ResponseEntity<>(detallesError, HttpStatus.BAD_REQUEST);
    }
}
