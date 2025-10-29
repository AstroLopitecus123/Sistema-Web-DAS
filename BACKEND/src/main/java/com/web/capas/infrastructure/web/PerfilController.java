package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.UsuarioRequest;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.CredencialesInvalidasException;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.application.service.UsuarioService;
import com.web.capas.domain.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Controlador para gestión de perfil de usuario (cualquier usuario autenticado)
@RestController
@RequestMapping("/api/v1/usuarios")
public class PerfilController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    // Obtiene el perfil del usuario por ID (GET /api/v1/usuarios/{id})
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
        respuesta.put("username", usuario.getUsername());
        respuesta.put("telefono", usuario.getTelefono());
        respuesta.put("direccion", usuario.getDireccion());
        respuesta.put("rol", usuario.getRol().toString());
        respuesta.put("activo", usuario.getActivo());
        respuesta.put("fechaRegistro", usuario.getFechaRegistro());
        
        return ResponseEntity.ok(respuesta);
    }

    // Actualiza el perfil del usuario - nombre, apellido, telefono, direccion (PUT /api/v1/usuarios/perfil/{id})
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
        
        Map<String, Object> usuarioMap = new HashMap<>();
        usuarioMap.put("idUsuario", usuarioActualizado.getIdUsuario());
        usuarioMap.put("nombre", usuarioActualizado.getNombre());
        usuarioMap.put("apellido", usuarioActualizado.getApellido());
        usuarioMap.put("email", usuarioActualizado.getEmail());
        usuarioMap.put("username", usuarioActualizado.getUsername());
        usuarioMap.put("telefono", usuarioActualizado.getTelefono() != null ? usuarioActualizado.getTelefono() : "");
        usuarioMap.put("direccion", usuarioActualizado.getDireccion() != null ? usuarioActualizado.getDireccion() : "");
        usuarioMap.put("rol", usuarioActualizado.getRol().toString());
        
        respuesta.put("usuario", usuarioMap);
        
        return ResponseEntity.ok(respuesta);
    }

    // Cambia la contraseña del usuario (PUT /api/v1/usuarios/cambiar-contrasena/{id})
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

    // Elimina la cuenta del usuario (DELETE /api/v1/usuarios/{id})
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

    // Obtiene el perfil del usuario por username (GET /api/v1/usuarios/username/{username})
    @GetMapping("/username/{username}")
    public ResponseEntity<?> obtenerPerfilPorUsername(@PathVariable String username) {
        Usuario usuario = usuarioService.obtenerUsuarioPorUsername(username);
        
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
        // Respuesta sin contraseña
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idUsuario", usuario.getIdUsuario());
        respuesta.put("nombre", usuario.getNombre());
        respuesta.put("apellido", usuario.getApellido());
        respuesta.put("email", usuario.getEmail());
        respuesta.put("username", usuario.getUsername());
        respuesta.put("telefono", usuario.getTelefono());
        respuesta.put("direccion", usuario.getDireccion());
        respuesta.put("rol", usuario.getRol().toString());
        respuesta.put("activo", usuario.getActivo());
        respuesta.put("fechaRegistro", usuario.getFechaRegistro());
        
        return ResponseEntity.ok(respuesta);
    }

    // Obtiene estadísticas del usuario - pedidos, total gastado, cupones (GET /api/v1/usuarios/estadisticas/{idUsuario})
    @GetMapping("/estadisticas/{idUsuario}")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(@PathVariable Integer idUsuario) {
        // Verificar que el usuario existe
        Usuario usuario = usuarioService.obtenerUsuarioPorId(idUsuario);
        
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
        // Obtener todos los pedidos del cliente
        List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuario(idUsuario);
        
        // Contar pedidos realizados (excluyendo cancelados)
        long pedidosRealizados = pedidos.stream()
            .filter(p -> p.getEstadoPedido() != Pedido.EstadoPedido.cancelado)
            .count();
        
        // Calcular total gastado (solo pedidos que no estén cancelados)
        BigDecimal totalGastado = pedidos.stream()
            .filter(p -> p.getEstadoPedido() != Pedido.EstadoPedido.cancelado)
            .map(Pedido::getTotalPedido)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Por ahora, cupones usados queda en 0 (se puede implementar después)
        int cuponesUsados = 0;
        
        // Construir respuesta
        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("pedidosRealizados", pedidosRealizados);
        estadisticas.put("totalGastado", totalGastado.doubleValue());
        estadisticas.put("cuponesUsados", cuponesUsados);
        
        return ResponseEntity.ok(estadisticas);
    }
}
