package com.web.controller;

import com.web.dto.UsuarioRequest;
import com.web.exception.RecursoNoEncontradoExcepcion;
import com.web.exception.ServiceException;
import com.web.exception.CredencialesInvalidasException;
import com.web.model.Usuario;
import com.web.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para gestión de perfil de usuario
 * Rutas disponibles para cualquier usuario autenticado (no solo admin)
 */
@RestController
@RequestMapping("/api/v1/usuarios")
public class PerfilController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Obtiene el perfil del usuario actual por ID
     * GET /api/v1/usuarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPerfil(@PathVariable Integer id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
        // Respuesta sin contraseña
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idUsuario", usuario.getIdUsuario());
        respuesta.put("nombre", usuario.getNombre());
        respuesta.put("apellido", usuario.getApellido());
        respuesta.put("email", usuario.getEmail());
        respuesta.put("telefono", usuario.getTelefono());
        respuesta.put("direccion", usuario.getDireccion());
        respuesta.put("rol", usuario.getRol().toString());
        respuesta.put("activo", usuario.getActivo());
        respuesta.put("fechaRegistro", usuario.getFechaRegistro());
        
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Actualiza el perfil del usuario (nombre, apellido, telefono, direccion)
     * NO permite cambiar email ni contraseña
     * PUT /api/v1/usuarios/perfil/{id}
     */
    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> actualizarPerfil(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        
        // Validar datos de entrada
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre es obligatorio");
        }
        
        if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            throw new ServiceException("El apellido es obligatorio");
        }
        
        // Guardar cambios
        Usuario usuarioActualizado = usuarioService.actualizarPerfil(
            id,
            request.getNombre(),
            request.getApellido(),
            request.getTelefono(),
            request.getDireccion()
        );
        
        if (usuarioActualizado == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
        // Respuesta exitosa
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("success", true);
        respuesta.put("mensaje", "Perfil actualizado correctamente");
        respuesta.put("usuario", Map.of(
            "idUsuario", usuarioActualizado.getIdUsuario(),
            "nombre", usuarioActualizado.getNombre(),
            "apellido", usuarioActualizado.getApellido(),
            "email", usuarioActualizado.getEmail(),
            "telefono", usuarioActualizado.getTelefono() != null ? usuarioActualizado.getTelefono() : "",
            "direccion", usuarioActualizado.getDireccion() != null ? usuarioActualizado.getDireccion() : "",
            "rol", usuarioActualizado.getRol().toString()
        ));
        
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Cambia la contraseña del usuario
     * Requiere la contraseña actual para validar identidad
     * PUT /api/v1/usuarios/cambiar-contrasena/{id}
     */
    @PutMapping("/cambiar-contrasena/{id}")
    public ResponseEntity<?> cambiarContrasena(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        
        // Validar datos de entrada
        if (request.getContrasenaActual() == null || request.getContrasenaActual().trim().isEmpty()) {
            throw new ServiceException("La contraseña actual es obligatoria");
        }
        
        if (request.getNuevaContrasena() == null || request.getNuevaContrasena().trim().isEmpty()) {
            throw new ServiceException("La nueva contraseña es obligatoria");
        }
        
        if (request.getNuevaContrasena().length() < 6) {
            throw new ServiceException("La nueva contraseña debe tener al menos 6 caracteres");
        }
        
        // Intentar cambiar la contraseña
        boolean cambiado = usuarioService.cambiarContrasena(
            id,
            request.getContrasenaActual(),
            request.getNuevaContrasena()
        );
        
        if (!cambiado) {
            throw new CredencialesInvalidasException("La contraseña actual es incorrecta");
        }
        
        // Cambio exitoso
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("success", true);
        respuesta.put("mensaje", "Contraseña actualizada correctamente");
        
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Elimina la cuenta del usuario 
     * DELETE /api/v1/usuarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCuenta(@PathVariable Integer id) {
        try {
            // Verificar usuario
            Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
            
            if (usuario == null) {
                throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
            }
            
            // Verificar si es un administrador - no permitir que se elimine a sí mismo
            if (usuario.getRol() == Usuario.Rol.administrador) {
                throw new ServiceException("Los administradores no pueden eliminar su propia cuenta desde aquí");
            }
            
            System.out.println("Usuario " + id + " solicitando eliminación de su cuenta");
            
            boolean eliminado = usuarioService.eliminarUsuarioSeguro(id);
            
            if (!eliminado) {
                throw new ServiceException("No se pudo eliminar la cuenta");
            }
            
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("success", true);
            respuesta.put("mensaje", "Cuenta eliminada exitosamente");
            return ResponseEntity.ok(respuesta);
            
        } catch (RecursoNoEncontradoExcepcion | ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al eliminar cuenta del usuario " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al eliminar la cuenta: " + e.getMessage());
        }
    }
}
