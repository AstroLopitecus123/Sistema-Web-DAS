package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.*;
import com.web.capas.domain.CredencialesInvalidasException;
import com.web.capas.domain.ServiceException;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import com.web.capas.application.service.UsuarioService;
import com.web.capas.application.service.JwtService;
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

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }

        if (request.getContrasena() == null || request.getContrasena().length() < 6) {
            throw new ServiceException("La contraseña debe tener al menos 6 caracteres");
        }

        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre es obligatorio");
        }

        if (usuarioService.existeEmail(request.getEmail())) {
            throw new ServiceException("El email ya está registrado");
        }

        String baseUsername = request.getEmail().split("@")[0].toLowerCase()
            .replaceAll("[^a-z0-9]", "_");
        String username = baseUsername;
        int counter = 1;
        
        while (usuarioService.existeUsername(username)) {
            username = baseUsername + "_" + counter;
            counter++;
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setApellido(request.getApellido() != null ? request.getApellido() : "");
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setUsername(username);
        nuevoUsuario.setContrasenaEncriptada(request.getContrasena());
        nuevoUsuario.setTelefono(request.getTelefono());
        nuevoUsuario.setDireccion(request.getDireccion());
        nuevoUsuario.setRol(Usuario.Rol.cliente);
        nuevoUsuario.setActivo(true);

        Usuario usuarioRegistrado = usuarioService.registrarUsuario(nuevoUsuario);
        String token = jwtService.generateToken(usuarioRegistrado);

        AuthResponse.AuthData authData = new AuthResponse.AuthData(
            token,
            usuarioRegistrado.getIdUsuario(),
            usuarioRegistrado.getNombre(),
            usuarioRegistrado.getApellido(),
            usuarioRegistrado.getEmail(),
            usuarioRegistrado.getUsername(),
            usuarioRegistrado.getTelefono(),
            usuarioRegistrado.getDireccion(),
            usuarioRegistrado.getRol().toString()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
            new AuthResponse(true, "Usuario registrado exitosamente", authData)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UsuarioRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }

        if (request.getContrasena() == null || request.getContrasena().trim().isEmpty()) {
            throw new ServiceException("La contraseña es obligatoria");
        }

        Usuario usuario = usuarioService.autenticarUsuario(request.getEmail(), request.getContrasena());

        if (usuario == null) {
            throw new CredencialesInvalidasException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(usuario);

        AuthResponse.AuthData authData = new AuthResponse.AuthData(
            token,
            usuario.getIdUsuario(),
            usuario.getNombre(),
            usuario.getApellido(),
            usuario.getEmail(),
            usuario.getUsername(),
            usuario.getTelefono(),
            usuario.getDireccion(),
            usuario.getRol().toString()
        );

        return ResponseEntity.ok(
            new AuthResponse(true, "Login exitoso", authData)
        );
    }

    @GetMapping("/verificar-email")
    public ResponseEntity<Boolean> verificarEmail(@RequestParam String email) {
        boolean existe = usuarioService.existeEmail(email);
        return ResponseEntity.ok(existe);
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<Map<String, Object>> solicitarRecuperacionContrasena(@RequestBody UsuarioRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }
        
        usuarioService.solicitarRecuperacionContrasena(request.getEmail());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.");
        return ResponseEntity.ok(response);
    }

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

    @PutMapping("/actualizar-perfil/{id}")
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
        
        if (usuarioActualizado == null) {
            throw new ServiceException("Usuario no encontrado");
        }
        
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

    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<Map<String, Object>> cambiarContrasena(@RequestBody Map<String, Object> request) {
        Integer idUsuario = (Integer) request.get("idUsuario");
        String contrasenaActual = (String) request.get("contrasenaActual");
        String nuevaContrasena = (String) request.get("nuevaContrasena");
        
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
        
        boolean cambiado = usuarioService.cambiarContrasena(
            idUsuario,
            contrasenaActual,
            nuevaContrasena
        );
        
        if (!cambiado) {
            throw new CredencialesInvalidasException("La contraseña actual es incorrecta");
        }
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("success", true);
        respuesta.put("mensaje", "Contraseña actualizada correctamente");
        
        return ResponseEntity.ok(respuesta);
    }
}
