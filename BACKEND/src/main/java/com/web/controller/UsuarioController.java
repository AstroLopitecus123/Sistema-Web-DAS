package com.web.controller;

import com.web.exception.RecursoNoEncontradoExcepcion;
import com.web.exception.ServiceException;
import com.web.model.Usuario;
import com.web.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Obtiene todos los usuarios (solo para administradores)
     * GET /api/admin/usuarios
     */
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioService.obtenerTodosLosUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Obtiene un usuario por ID (solo para administradores)
     * GET /api/admin/usuarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Integer id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        
        return ResponseEntity.ok(usuario);
    }

    /**
     * Elimina un usuario por ID (solo para administradores)
     * DELETE /api/admin/usuarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarUsuario(@PathVariable Integer id) {
        try {
            boolean resultado = usuarioService.eliminarUsuario(id);
            if (resultado) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Usuario eliminado exitosamente"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "No se pudo eliminar el usuario"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    /**
     * Elimina un usuario de forma segura (solo para administradores)
     * DELETE /api/admin/usuarios/{id}/seguro
     */
    @DeleteMapping("/{id}/seguro")
    public ResponseEntity<Map<String, Object>> eliminarUsuarioSeguro(@PathVariable Integer id) {
        try {
            System.out.println("Intentando eliminar usuario ID: " + id);
            boolean eliminado = usuarioService.eliminarUsuarioSeguro(id);
            System.out.println("Resultado eliminación: " + eliminado);
            
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
        } catch (Exception e) {
            System.err.println("Error en eliminarUsuarioSeguro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    /**
     * Activa/Desactiva un usuario (solo para administradores)
     * PUT /api/admin/usuarios/{id}/estado
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstadoUsuario(@PathVariable Integer id, @RequestParam boolean activo) {
        try {
            boolean resultado = usuarioService.cambiarEstadoUsuario(id, activo);
            if (resultado) {
                String mensaje = activo ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente";
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", mensaje,
                    "activo", activo
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "No se pudo cambiar el estado del usuario"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtiene estadísticas de usuarios (solo para administradores)
     * GET /api/admin/usuarios/estadisticas
     */
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
    public ResponseEntity<Map<String, Object>> cambiarRolUsuario(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String nuevoRol = request.get("rol");
        
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
