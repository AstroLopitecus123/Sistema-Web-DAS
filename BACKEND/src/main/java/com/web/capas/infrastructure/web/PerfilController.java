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

@RestController
@RequestMapping("/api/v1/usuarios")
public class PerfilController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPerfil(@PathVariable Integer id) {

        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        
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

    @PutMapping("/perfil/{id}")
    public ResponseEntity<Map<String, Object>> actualizarPerfil(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre es obligatorio");
        }
        
        if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            throw new ServiceException("El apellido es obligatorio");
        }
        
        Usuario usuarioActualizado = usuarioService.actualizarPerfil(
            id,
            request.getNombre(),
            request.getApellido(),
            request.getTelefono(),
            request.getDireccion()
        );
        
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

    @PutMapping("/cambiar-contrasena/{id}")
    public ResponseEntity<?> cambiarContrasena(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        
        if (request.getContrasenaActual() == null || request.getContrasenaActual().trim().isEmpty()) {
            throw new ServiceException("La contraseña actual es obligatoria");
        }
        
        if (request.getNuevaContrasena() == null || request.getNuevaContrasena().trim().isEmpty()) {
            throw new ServiceException("La nueva contraseña es obligatoria");
        }
        
        if (request.getNuevaContrasena().length() < 6) {
            throw new ServiceException("La nueva contraseña debe tener al menos 6 caracteres");
        }
        
        boolean cambiado = usuarioService.cambiarContrasena(
            id,
            request.getContrasenaActual(),
            request.getNuevaContrasena()
        );
        
        if (!cambiado) {
            throw new CredencialesInvalidasException("La contraseña actual es incorrecta");
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Contraseña actualizada correctamente"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCuenta(@PathVariable Integer id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        
        if (usuario.getRol() == Usuario.Rol.administrador) {
            throw new ServiceException("Los administradores no pueden eliminar su propia cuenta desde aquí");
        }
        
        usuarioService.eliminarUsuarioSeguro(id);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Cuenta eliminada exitosamente"
        ));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<Map<String, Object>> obtenerPerfilPorUsername(@PathVariable String username) {
        Usuario usuario = usuarioService.obtenerUsuarioPorUsername(username);
        
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
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

    @GetMapping("/estadisticas/{idUsuario}")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(@PathVariable Integer idUsuario) {
        usuarioService.obtenerUsuarioPorId(idUsuario);
        
        List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuario(idUsuario);
        
        long pedidosRealizados = pedidos.stream()
            .filter(p -> p.getEstadoPedido() != Pedido.EstadoPedido.cancelado)
            .count();
        
        BigDecimal totalGastado = pedidos.stream()
            .filter(p -> p.getEstadoPedido() != Pedido.EstadoPedido.cancelado)
            .map(Pedido::getTotalPedido)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long cuponesUsados = pedidos.stream()
            .filter(p -> p.getEstadoPedido() != Pedido.EstadoPedido.cancelado)
            .filter(p -> p.getCodigoCupon() != null && !p.getCodigoCupon().trim().isEmpty())
            .count();
        
        return ResponseEntity.ok(Map.of(
            "pedidosRealizados", pedidosRealizados,
            "totalGastado", totalGastado.doubleValue(),
            "cuponesUsados", cuponesUsados
        ));
    }
    
    @PutMapping("/player-id/{id}")
    public ResponseEntity<Map<String, Object>> guardarPlayerId(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        
        String playerId = request.get("playerId");
        
        if (playerId == null || playerId.trim().isEmpty()) {
            throw new ServiceException("El Player ID es obligatorio");
        }
        
        Usuario usuario = usuarioService.actualizarPlayerId(id, playerId.trim());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "mensaje", "Player ID guardado correctamente",
            "playerId", usuario.getPlayerId()
        ));
    }
}
