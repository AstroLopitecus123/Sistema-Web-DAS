package com.web.capas.application.service;

import com.web.capas.domain.dto.UsuarioResponse;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import java.util.List;

public interface UsuarioService {
    
    Usuario registrarUsuario(Usuario usuario);
    
    Usuario autenticarUsuario(String email, String contrasena);
    
    Usuario buscarPorEmail(String email);
    
    Usuario obtenerUsuarioPorUsername(String username);
    
    boolean existeEmail(String email);
    
    boolean existeUsername(String username);
    
    List<Usuario> obtenerTodosLosUsuarios();
    
    Usuario obtenerUsuarioPorId(Integer id);
    
    boolean eliminarUsuario(Integer id);
    
    boolean eliminarUsuarioSeguro(Integer id);
    
    boolean cambiarEstadoUsuario(Integer id, boolean activo);
    
    long contarUsuarios();
    
    long contarUsuariosActivos();
    
    long contarUsuariosPorRol(Usuario.Rol rol);
    
    Usuario cambiarRolUsuario(Integer idUsuario, String nuevoRol);
    
    Usuario actualizarPerfil(Integer idUsuario, String nombre, String apellido, String telefono, String direccion);
    
    boolean cambiarContrasena(Integer idUsuario, String contrasenaActual, String nuevaContrasena);
    
    void solicitarRecuperacionContrasena(String email);
    
    boolean restablecerContrasena(String token, String nuevaContrasena);
    
    UsuarioResponse mapearAUsuarioResponse(Usuario usuario);
    
    List<UsuarioResponse> obtenerTodosLosUsuariosComoDTO();
    
    UsuarioResponse obtenerUsuarioPorIdComoDTO(Integer id);
    
    Usuario actualizarPlayerId(Integer idUsuario, String playerId);
}
