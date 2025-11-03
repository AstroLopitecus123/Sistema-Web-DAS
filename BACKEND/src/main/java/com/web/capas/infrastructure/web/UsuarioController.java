package com.web.capas.infrastructure.web;

import com.web.capas.application.service.UsuarioService;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.dto.CambioRolRequest;
import com.web.capas.domain.dto.UsuarioResponse;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Obtiene todos los usuarios - solo administradores (GET /api/admin/usuarios)
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> obtenerTodosLosUsuarios() {
        List<UsuarioResponse> usuarios = usuarioService.obtenerTodosLosUsuariosComoDTO();
        return ResponseEntity.ok(usuarios);
    }

    // Obtiene un usuario por ID - solo administradores (GET /api/admin/usuarios/{id})
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtenerUsuarioPorId(@PathVariable Integer id) {
        UsuarioResponse usuario = usuarioService.obtenerUsuarioPorIdComoDTO(id);
        return ResponseEntity.ok(usuario);
    }

    // Elimina un usuario por ID - solo administradores (DELETE /api/admin/usuarios/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarUsuario(@PathVariable Integer id) {
        boolean resultado = usuarioService.eliminarUsuario(id);
        if (resultado) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Usuario eliminado exitosamente"
            ));
        } else {
            throw new ServiceException("No se pudo eliminar el usuario");
        }
    }

    // Elimina un usuario de forma segura - solo administradores (DELETE /api/admin/usuarios/{id}/seguro)
    @DeleteMapping("/{id}/seguro")
    public ResponseEntity<Map<String, Object>> eliminarUsuarioSeguro(@PathVariable Integer id) {
        boolean eliminado = usuarioService.eliminarUsuarioSeguro(id);
        
        if (eliminado) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Usuario eliminado exitosamente",
                "accion", "eliminado"
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Usuario desactivado exitosamente (no se pudo eliminar por restricciones de datos)",
                "accion", "desactivado"
            ));
        }
    }

    // Activa/Desactiva un usuario - solo administradores (PUT /api/admin/usuarios/{id}/estado)
    @PutMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstadoUsuario(@PathVariable Integer id, @RequestParam boolean activo) {
        boolean resultado = usuarioService.cambiarEstadoUsuario(id, activo);
        if (!resultado) {
            throw new ServiceException("No se pudo cambiar el estado del usuario");
        }
        
        String mensaje = activo ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente";
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", mensaje,
            "activo", activo
        ));
    }

    // Obtiene estadísticas de usuarios - solo administradores (GET /api/admin/usuarios/estadisticas)
    @GetMapping("/estadisticas")
    public ResponseEntity<Object> obtenerEstadisticasUsuarios() {
        long totalUsuarios = usuarioService.contarUsuarios();
        long usuariosActivos = usuarioService.contarUsuariosActivos();
        long clientes = usuarioService.contarUsuariosPorRol(Usuario.Rol.cliente);
        long administradores = usuarioService.contarUsuariosPorRol(Usuario.Rol.administrador);
        long repartidores = usuarioService.contarUsuariosPorRol(Usuario.Rol.repartidor);
        long vendedores = usuarioService.contarUsuariosPorRol(Usuario.Rol.vendedor);

        // Map de estadísticas
        java.util.Map<String, Object> estadisticas = new java.util.HashMap<>();
        estadisticas.put("totalUsuarios", totalUsuarios);
        estadisticas.put("usuariosActivos", usuariosActivos);
        estadisticas.put("usuariosInactivos", totalUsuarios - usuariosActivos);
        estadisticas.put("clientes", clientes);
        estadisticas.put("administradores", administradores);
        estadisticas.put("repartidores", repartidores);
        estadisticas.put("vendedores", vendedores);

        return ResponseEntity.ok(estadisticas);
    }

    @PutMapping("/cambiar-rol/{id}")
    public ResponseEntity<Map<String, Object>> cambiarRolUsuario(@PathVariable Integer id, @RequestBody CambioRolRequest request) {
        String nuevoRol = request.getRol();
        
        if (nuevoRol == null || nuevoRol.trim().isEmpty()) {
            throw new ServiceException("El rol no puede estar vacío");
        }

        // Validar que el rol sea válido
        if (!nuevoRol.equals("cliente") && !nuevoRol.equals("administrador") && 
            !nuevoRol.equals("repartidor")) {
            throw new ServiceException("Rol no válido");
        }

        Usuario usuario = usuarioService.cambiarRolUsuario(id, nuevoRol);
        
        return ResponseEntity.ok(Map.of(
            "success", true, 
            "message", "Rol actualizado correctamente",
            "usuario", Map.of(
                "id", usuario.getIdUsuario(),
                "nombre", usuario.getNombre(),
                "apellido", usuario.getApellido(),
                "email", usuario.getEmail(),
                "rol", usuario.getRol()
            )
        ));
    }
}
