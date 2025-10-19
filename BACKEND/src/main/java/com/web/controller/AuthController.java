package com.web.controller;

import com.web.dto.*;
import com.web.exception.CredencialesInvalidasException;
import com.web.exception.ServiceException;
import com.web.model.Usuario;
import com.web.service.UsuarioService;
import com.web.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private JwtService jwtService;

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrarUsuario(@RequestBody UsuarioRequest request) {
        // Validaciones básicas
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }

        if (request.getContrasena() == null || request.getContrasena().length() < 6) {
            throw new ServiceException("La contraseña debe tener al menos 6 caracteres");
        }

        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre es obligatorio");
        }

        // Verificar correo duplicado
        if (usuarioService.existeEmail(request.getEmail())) {
            throw new ServiceException("El email ya está registrado");
        }

        // Crear usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setApellido(request.getApellido() != null ? request.getApellido() : "");
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setContrasenaEncriptada(request.getContrasena());
        nuevoUsuario.setTelefono(request.getTelefono());
        nuevoUsuario.setDireccion(request.getDireccion());
        nuevoUsuario.setRol(Usuario.Rol.cliente);
        nuevoUsuario.setActivo(true);

        Usuario usuarioRegistrado = usuarioService.registrarUsuario(nuevoUsuario);

        // Crear token
        String token = jwtService.generateToken(usuarioRegistrado);

        // Respuesta con datos del usuario
        AuthResponse.AuthData authData = new AuthResponse.AuthData(
            token,
            usuarioRegistrado.getIdUsuario(),
            usuarioRegistrado.getNombre(),
            usuarioRegistrado.getApellido(),
            usuarioRegistrado.getEmail(),
            usuarioRegistrado.getTelefono(),
            usuarioRegistrado.getDireccion(),
            usuarioRegistrado.getRol().toString()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
            new AuthResponse(true, "Usuario registrado exitosamente", authData)
        );
    }

    // Login de usuarios
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UsuarioRequest request) {
        // Validar datos
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }

        if (request.getContrasena() == null || request.getContrasena().trim().isEmpty()) {
            throw new ServiceException("La contraseña es obligatoria");
        }

        // Verificar credenciales
        Usuario usuario = usuarioService.autenticarUsuario(request.getEmail(), request.getContrasena());

        if (usuario == null) {
            throw new CredencialesInvalidasException("Credenciales inválidas");
        }

        // Crear token
        String token = jwtService.generateToken(usuario);

        // Enviar datos del usuario autenticado
        AuthResponse.AuthData authData = new AuthResponse.AuthData(
            token,
            usuario.getIdUsuario(),
            usuario.getNombre(),
            usuario.getApellido(),
            usuario.getEmail(),
            usuario.getTelefono(),
            usuario.getDireccion(),
            usuario.getRol().toString()
        );

        return ResponseEntity.ok(
            new AuthResponse(true, "Login exitoso", authData)
        );
    }

    // Verificar si correo existe
    @GetMapping("/verificar-email")
    public ResponseEntity<Boolean> verificarEmail(@RequestParam String email) {
        boolean existe = usuarioService.existeEmail(email);
        return ResponseEntity.ok(existe);
    }

    // Solicitar recuperación de contraseña
    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<Map<String, Object>> solicitarRecuperacionContrasena(@RequestBody UsuarioRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }
        
        usuarioService.solicitarRecuperacionContrasena(request.getEmail());
        
        // Por seguridad, siempre devuelve el mismo mensaje sin revelar si el correo existe
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.");
        return ResponseEntity.ok(response);
    }

    // Restablecer contraseña con el token del correo
    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<Map<String, Object>> restablecerContrasena(@RequestBody UsuarioRequest request) {
        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            throw new ServiceException("El token es obligatorio");
        }
        
        if (request.getNuevaContrasena() == null || request.getNuevaContrasena().trim().isEmpty()) {
            throw new ServiceException("La nueva contraseña es obligatoria");
        }
        
        boolean exito = usuarioService.restablecerContrasena(request.getToken(), request.getNuevaContrasena());
        
        if (exito) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Tu contraseña ha sido restablecida exitosamente");
            return ResponseEntity.ok(response);
        } else {
            throw new ServiceException("No se pudo restablecer la contraseña");
        }
    }

    // Actualizar perfil de usuario
    @PutMapping("/actualizar-perfil/{id}")
    public ResponseEntity<Map<String, Object>> actualizarPerfil(
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
            throw new ServiceException("Usuario no encontrado");
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

    // Cambiar contraseña de usuario
    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<Map<String, Object>> cambiarContrasena(@RequestBody Map<String, Object> request) {
        // Extraer datos del request
        Integer idUsuario = (Integer) request.get("idUsuario");
        String contrasenaActual = (String) request.get("contrasenaActual");
        String nuevaContrasena = (String) request.get("nuevaContrasena");
        
        // Validar datos de entrada
        if (idUsuario == null) {
            throw new ServiceException("El ID de usuario es obligatorio");
        }
        
        if (contrasenaActual == null || contrasenaActual.trim().isEmpty()) {
            throw new ServiceException("La contraseña actual es obligatoria");
        }
        
        if (nuevaContrasena == null || nuevaContrasena.trim().isEmpty()) {
            throw new ServiceException("La nueva contraseña es obligatoria");
        }
        
        if (nuevaContrasena.length() < 6) {
            throw new ServiceException("La nueva contraseña debe tener al menos 6 caracteres");
        }
        
        // Intentar cambiar la contraseña
        boolean cambiado = usuarioService.cambiarContrasena(
            idUsuario,
            contrasenaActual,
            nuevaContrasena
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
}
