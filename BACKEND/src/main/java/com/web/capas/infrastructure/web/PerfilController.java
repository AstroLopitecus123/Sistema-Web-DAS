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
    public ResponseEntity<Map<String, Object>> obtenerPerfil(@PathVariable Integer id) {

        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        
        // Respuesta sin contraseña
        return ResponseEntity.ok(Map.of(
            "idUsuario", usuario.getIdUsuario(),
            "nombre", usuario.getNombre(),
            "apellido", usuario.getApellido(),
            "email", usuario.getEmail(),
            "username", usuario.getUsername(),
            "telefono", usuario.getTelefono() != null ? usuario.getTelefono() : "",
            "direccion", usuario.getDireccion() != null ? usuario.getDireccion() : "",
            "rol", usuario.getRol().toString(),
            "activo", usuario.getActivo(),
            "fechaRegistro", usuario.getFechaRegistro() != null ? usuario.getFechaRegistro().toString() : ""
        ));
    }

    // Actualiza el perfil del usuario - nombre, apellido, telefono, direccion (PUT /api/v1/usuarios/perfil/{id})
    @PutMapping("/perfil/{id}")
    public ResponseEntity<Map<String, Object>> actualizarPerfil(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        
        // Validar datos de entrada - GlobalExceptionHandler maneja ServiceException
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre es obligatorio");
        }
        
        if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            throw new ServiceException("El apellido es obligatorio");
        }
        
        // El servicio ya lanza RecursoNoEncontradoExcepcion si no existe
        Usuario usuarioActualizado = usuarioService.actualizarPerfil(
            id,
            request.getNombre(),
            request.getApellido(),
            request.getTelefono(),
            request.getDireccion()
        );
        
        // Respuesta exitosa
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Perfil actualizado correctamente",
            "usuario", Map.of(
                "idUsuario", usuarioActualizado.getIdUsuario(),
                "nombre", usuarioActualizado.getNombre(),
                "apellido", usuarioActualizado.getApellido(),
                "email", usuarioActualizado.getEmail(),
                "username", usuarioActualizado.getUsername(),
                "telefono", usuarioActualizado.getTelefono() != null ? usuarioActualizado.getTelefono() : "",
                "direccion", usuarioActualizado.getDireccion() != null ? usuarioActualizado.getDireccion() : "",
                "rol", usuarioActualizado.getRol().toString()
            )
        ));
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
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Contraseña actualizada correctamente"
        ));
    }

    // Elimina la cuenta del usuario (DELETE /api/v1/usuarios/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCuenta(@PathVariable Integer id) {
        // Verificar usuario - el servicio ya lanza RecursoNoEncontradoExcepcion si no existe
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        
        // Verificar si es un administrador - no permitir que se elimine a sí mismo
        if (usuario.getRol() == Usuario.Rol.administrador) {
            throw new ServiceException("Los administradores no pueden eliminar su propia cuenta desde aquí");
        }
        
        // El servicio ya lanza ServiceException si falla
        usuarioService.eliminarUsuarioSeguro(id);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Cuenta eliminada exitosamente"
        ));
    }

    // Obtiene el perfil del usuario por username (GET /api/v1/usuarios/username/{username})
    @GetMapping("/username/{username}")
    public ResponseEntity<Map<String, Object>> obtenerPerfilPorUsername(@PathVariable String username) {
        Usuario usuario = usuarioService.obtenerUsuarioPorUsername(username);
        
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
        // Respuesta sin contraseña
        return ResponseEntity.ok(Map.of(
            "idUsuario", usuario.getIdUsuario(),
            "nombre", usuario.getNombre(),
            "apellido", usuario.getApellido(),
            "email", usuario.getEmail(),
            "username", usuario.getUsername(),
            "telefono", usuario.getTelefono() != null ? usuario.getTelefono() : "",
            "direccion", usuario.getDireccion() != null ? usuario.getDireccion() : "",
            "rol", usuario.getRol().toString(),
            "activo", usuario.getActivo(),
            "fechaRegistro", usuario.getFechaRegistro() != null ? usuario.getFechaRegistro().toString() : ""
        ));
    }

    // Obtiene estadísticas del usuario - pedidos, total gastado, cupones (GET /api/v1/usuarios/estadisticas/{idUsuario})
    @GetMapping("/estadisticas/{idUsuario}")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(@PathVariable Integer idUsuario) {
        // El servicio ya lanza RecursoNoEncontradoExcepcion si no existe - solo validamos que exista
        usuarioService.obtenerUsuarioPorId(idUsuario);
        
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
        
        int cuponesUsados = 0;
        
        // Construir respuesta
        return ResponseEntity.ok(Map.of(
            "pedidosRealizados", pedidosRealizados,
            "totalGastado", totalGastado.doubleValue(),
            "cuponesUsados", cuponesUsados
        ));
    }
}
