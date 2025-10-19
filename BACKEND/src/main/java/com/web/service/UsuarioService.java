package com.web.service;

import com.web.model.Usuario;
import java.util.List;

public interface UsuarioService {
    
    // Registra un nuevo usuario en el sistema
    Usuario registrarUsuario(Usuario usuario);
    
    // Autentica un usuario con email y contraseña
    Usuario autenticarUsuario(String email, String contrasena);
    
    // Busca un usuario por su email
    Usuario buscarPorEmail(String email);
    
    // Verifica si un email ya está registrado
    boolean existeEmail(String email);
    
    // Métodos para administración
    
    // Obtiene todos los usuarios del sistema
    List<Usuario> obtenerTodosLosUsuarios();
    
    // Obtiene un usuario por su ID
    Usuario obtenerUsuarioPorId(Integer id);
    
    // Elimina un usuario del sistema
    boolean eliminarUsuario(Integer id);
    
    // Elimina un usuario de forma segura
    boolean eliminarUsuarioSeguro(Integer id);
    
    // Cambia el estado activo/inactivo de un usuario
    boolean cambiarEstadoUsuario(Integer id, boolean activo);
    
    // Cuenta el total de usuarios
    long contarUsuarios();
    
    // Cuenta los usuarios activos
    long contarUsuariosActivos();
    
    // Cuenta los usuarios por rol
    long contarUsuariosPorRol(Usuario.Rol rol);
    
    // Cambia el rol de un usuario
    Usuario cambiarRolUsuario(Integer idUsuario, String nuevoRol);
    
    // Actualiza el perfil de un usuario (nombre, apellido, telefono, direccion)
    Usuario actualizarPerfil(Integer idUsuario, String nombre, String apellido, String telefono, String direccion);
    
    // Cambia la contraseña de un usuario
    boolean cambiarContrasena(Integer idUsuario, String contrasenaActual, String nuevaContrasena);
    
    // Genera un token de recuperación de contraseña y envía el correo
    void solicitarRecuperacionContrasena(String email);
    
    // Restablece la contraseña usando el token de recuperación
    boolean restablecerContrasena(String token, String nuevaContrasena);
}
