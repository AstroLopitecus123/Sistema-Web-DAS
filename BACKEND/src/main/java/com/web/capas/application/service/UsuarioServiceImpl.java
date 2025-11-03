package com.web.capas.application.service;

import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.domain.CredencialesInvalidasException;
import com.web.capas.domain.dto.UsuarioResponse;
import com.web.capas.infrastructure.persistence.entities.PasswordResetToken;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.domain.repository.PasswordResetTokenRepository;
import com.web.capas.domain.repository.UsuarioRepository;
import com.web.capas.domain.repository.PedidoRepository;
import com.web.capas.domain.repository.CarritoRepository;
import com.web.capas.domain.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private CarritoRepository carritoRepository;
    
    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @Override
    @Transactional
    public Usuario registrarUsuario(Usuario usuario) {
        // Verificar correo duplicado
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new ServiceException("El email ya está registrado");
        }
        
        // Validar campos requeridos
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new ServiceException("El nombre es obligatorio");
        }
        
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            throw new ServiceException("El email es obligatorio");
        }
        
        if (usuario.getContrasenaEncriptada() == null || usuario.getContrasenaEncriptada().trim().isEmpty()) {
            throw new ServiceException("La contraseña es obligatoria");
        }
        
        if (usuario.getUsername() == null || usuario.getUsername().trim().isEmpty()) {
            throw new ServiceException("El username es obligatorio");
        }
        
        // Verificar username duplicado
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new ServiceException("El username ya está registrado");
        }
        
        // Encriptar contraseña
        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasenaEncriptada());
        usuario.setContrasenaEncriptada(contrasenaEncriptada);
        
        // Asignar valores por defecto
        if (usuario.getRol() == null) {
            usuario.setRol(Usuario.Rol.cliente);
        }
        
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }
        
        // Normalizar teléfono: asegurar que tenga +51
        if (usuario.getTelefono() != null && !usuario.getTelefono().trim().isEmpty()) {
            usuario.setTelefono(normalizarTelefono(usuario.getTelefono()));
        } else {
            usuario.setTelefono(null);
        }
        
        usuario.setFechaRegistro(LocalDateTime.now());
        
        return usuarioRepository.save(usuario);
    }
    
    @Override
    public Usuario autenticarUsuario(String email, String contrasena) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        
        if (usuario == null) {
            return null;
        }
        
        // Verificar contraseña
        if (!passwordEncoder.matches(contrasena, usuario.getContrasenaEncriptada())) {
            return null;
        }
        
        // Si la cuenta está desactivada
        if (!usuario.getActivo()) {
            throw new CredencialesInvalidasException("CUENTA_DESACTIVADA");
        }
        
        return usuario;
    }
    
    @Override
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
    }
    
    @Override
    public Usuario obtenerUsuarioPorUsername(String username) {
        return usuarioRepository.findByUsername(username).orElse(null);
    }
    
    @Override
    public boolean existeEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
    
    @Override
    public boolean existeUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }
    
    // Funciones para el admin
    
    @Override
    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }
    
    @Override
    public Usuario obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id).orElse(null);
    }
    
    @Override
    @Transactional
    public boolean eliminarUsuario(Integer id) {
        try {
            // Verificar que el usuario existe
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado para eliminar"));
            
            // Verificar si es un administrador - no permitir eliminar administradores
            if (usuario.getRol() == Usuario.Rol.administrador) {
                throw new ServiceException("No se puede eliminar un usuario administrador");
            }
            
            // Intentar eliminar el usuario
            // Si hay restricciones de clave foránea, se lanzará una excepción
            usuarioRepository.deleteById(id);
            return true;
            
        } catch (RecursoNoEncontradoExcepcion | ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            try {
                Usuario usuario = usuarioRepository.findById(id).orElse(null);
                if (usuario != null) {
                    usuario.setActivo(false);
                    usuarioRepository.save(usuario);
                    throw new ServiceException("No se puede eliminar el usuario porque tiene registros relacionados. Se ha desactivado en su lugar.", e);
                }
            } catch (Exception ex) {
                throw new ServiceException("Error al desactivar usuario como alternativa a la eliminación", ex);
            }
            return false;
        } catch (Exception e) {
            throw new ServiceException("Error al eliminar usuario", e);
        }
    }
    
    @Override
    @Transactional
    public boolean cambiarEstadoUsuario(Integer id, boolean activo) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
            
            usuario.setActivo(activo);
            usuarioRepository.save(usuario);
            return true;
        } catch (RecursoNoEncontradoExcepcion e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al cambiar estado del usuario", e);
        }
    }
    
    @Override
    @Transactional
    public boolean eliminarUsuarioSeguro(Integer id) {
        try {
            // Verificar que el usuario existe y no es administrador
            Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
            
            if (usuario.getRol() == Usuario.Rol.administrador) {
                throw new ServiceException("No se puede eliminar un usuario administrador");
            }
            
            eliminarDatosRelacionados(id);
            usuarioRepository.deleteById(id);
            
            return true;
            
        } catch (RecursoNoEncontradoExcepcion | ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al eliminar usuario: " + e.getMessage());
            throw new ServiceException("Error al eliminar usuario: " + e.getMessage(), e);
        }
    }
    
    // Elimina todos los datos relacionados a un usuario en el orden correcto
    private void eliminarDatosRelacionados(Integer idUsuario) {
        eliminarCarritoUsuario(idUsuario);
        
        eliminarTokensRecuperacion(idUsuario);
        
        eliminarPedidosUsuario(idUsuario);
    }
    
    // Elimina el carrito del usuario
    private void eliminarCarritoUsuario(Integer idUsuario) {
        try {
            carritoRepository.deleteByCliente_IdUsuario(idUsuario);
        } catch (Exception e) {
        }
    }
    
    // Elimina los tokens de recuperación del usuario
    private void eliminarTokensRecuperacion(Integer idUsuario) {
        try {
            passwordResetTokenRepository.deleteByUsuario_IdUsuario(idUsuario);
        } catch (Exception e) {
        }
    }
    
    // Elimina los pedidos del usuario y sus pagos asociados
    private void eliminarPedidosUsuario(Integer idUsuario) {
        List<Pedido> pedidos = pedidoRepository.findByCliente_IdUsuario(idUsuario);
        
        for (Pedido pedido : pedidos) {
            eliminarPagosPedido(pedido.getIdPedido());
            
            eliminarPedido(pedido.getIdPedido());
        }
    }
    
    // Elimina los pagos de un pedido específico
    private void eliminarPagosPedido(Integer idPedido) {
        try {
            pagoRepository.findByPedido_IdPedido(idPedido).ifPresent(pago -> {
                pagoRepository.delete(pago);
            });
        } catch (Exception e) {
        }
    }
    
    // Elimina un pedido específico
    private void eliminarPedido(Integer idPedido) {
        try {
            pedidoRepository.deleteById(idPedido);
        } catch (Exception e) {
        }
    }
    
    @Override
    public long contarUsuarios() {
        return usuarioRepository.count();
    }
    
    @Override
    public long contarUsuariosActivos() {
        return usuarioRepository.countByActivoTrue();
    }
    
    @Override
    public long contarUsuariosPorRol(Usuario.Rol rol) {
        return usuarioRepository.countByRol(rol);
    }

    @Override
    @Transactional
    public Usuario cambiarRolUsuario(Integer idUsuario, String nuevoRol) {
        try {
            Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
            
            // Convertir texto a enum
            Usuario.Rol rolEnum;
            switch (nuevoRol.toLowerCase()) {
                case "cliente":
                    rolEnum = Usuario.Rol.cliente;
                    break;
                case "administrador":
                    rolEnum = Usuario.Rol.administrador;
                    break;
                case "repartidor":
                    rolEnum = Usuario.Rol.repartidor;
                    break;
                default:
                    throw new ServiceException("Rol no válido: " + nuevoRol);
            }
            
            usuario.setRol(rolEnum);
            return usuarioRepository.save(usuario);
        } catch (RecursoNoEncontradoExcepcion | ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al cambiar rol del usuario", e);
        }
    }

    @Override
    @Transactional
    public Usuario actualizarPerfil(Integer idUsuario, String nombre, String apellido, String telefono, String direccion) {
        try {
            Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
            
            // Validar campos requeridos
            if (nombre == null || nombre.trim().isEmpty()) {
                throw new ServiceException("El nombre es obligatorio");
            }
            
            if (apellido == null || apellido.trim().isEmpty()) {
                throw new ServiceException("El apellido es obligatorio");
            }
            
            // Guardar cambios 
            usuario.setNombre(nombre.trim());
            usuario.setApellido(apellido.trim());
            // Normalizar teléfono: asegurar que tenga +51
            if (telefono != null && !telefono.trim().isEmpty()) {
                usuario.setTelefono(normalizarTelefono(telefono.trim()));
            } else {
                usuario.setTelefono(null);
            }
            usuario.setDireccion(direccion != null ? direccion.trim() : null);
            
            return usuarioRepository.save(usuario);
        } catch (RecursoNoEncontradoExcepcion | ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al actualizar perfil del usuario", e);
        }
    }

    @Override
    @Transactional
    public boolean cambiarContrasena(Integer idUsuario, String contrasenaActual, String nuevaContrasena) {
        try {
            // Validaciones
            if (nuevaContrasena == null || nuevaContrasena.trim().isEmpty()) {
                throw new ServiceException("La nueva contraseña no puede estar vacía");
            }
            
            if (nuevaContrasena.length() < 6) {
                throw new ServiceException("La nueva contraseña debe tener al menos 6 caracteres");
            }
            
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
            
            if (!usuarioOpt.isPresent()) {
                throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Verificar contraseña actual
            if (!passwordEncoder.matches(contrasenaActual, usuario.getContrasenaEncriptada())) {
                return false;
            }
            
            // La nueva debe ser diferente
            if (passwordEncoder.matches(nuevaContrasena, usuario.getContrasenaEncriptada())) {
                throw new ServiceException("La nueva contraseña debe ser diferente a la actual");
            }
            
            // Encriptar nueva contraseña
            String nuevaContrasenaEncriptada = passwordEncoder.encode(nuevaContrasena);
            usuario.setContrasenaEncriptada(nuevaContrasenaEncriptada);
            usuarioRepository.save(usuario);
            
            return true;
            
        } catch (ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al cambiar la contraseña", e);
        }
    }

    @Override
    @Transactional
    public void solicitarRecuperacionContrasena(String email) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            
            // Solo enviar correo si existe y está activo
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                
                if (usuario.getActivo()) {
                    String token = java.util.UUID.randomUUID().toString();
                    LocalDateTime expiracion = LocalDateTime.now().plusMinutes(15);
                    PasswordResetToken passwordResetToken = new PasswordResetToken(usuario, token, expiracion);
                    
                    passwordResetTokenRepository.save(passwordResetToken);
                    
                    emailService.enviarCorreoRecuperacion(
                        usuario.getEmail(), 
                        token, 
                        usuario.getNombre() + " " + usuario.getApellido()
                    );
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error al procesar recuperación: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public boolean restablecerContrasena(String token, String nuevaContrasena) {
        try {
            // Validaciones
            if (nuevaContrasena == null || nuevaContrasena.trim().isEmpty()) {
                throw new ServiceException("La nueva contraseña no puede estar vacía");
            }
            
            if (nuevaContrasena.length() < 6) {
                throw new ServiceException("La nueva contraseña debe tener al menos 6 caracteres");
            }
            
            // Buscar y validar token
            PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
                    .orElseThrow(() -> new ServiceException("Token inválido"));
            
            if (passwordResetToken.getUsado()) {
                throw new ServiceException("Este token ya fue utilizado");
            }
            
            if (passwordResetToken.isExpirado()) {
                throw new ServiceException("Este token ha expirado");
            }
            
            // Cambiar contraseña
            Usuario usuario = passwordResetToken.getUsuario();
            String nuevaContrasenaEncriptada = passwordEncoder.encode(nuevaContrasena);
            usuario.setContrasenaEncriptada(nuevaContrasenaEncriptada);
            usuarioRepository.save(usuario);
            
            // Marcar token como usado
            passwordResetToken.setUsado(true);
            passwordResetTokenRepository.save(passwordResetToken);
            
            return true;
            
        } catch (ServiceException | CredencialesInvalidasException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Error al restablecer la contraseña", e);
        }
    }

        // Normaliza el teléfono
    private String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.trim().isEmpty()) {
            return null;
        }

        // Remover espacios
        String telefonoLimpio = telefono.replaceAll("\\s+", "");

        // Si empieza con +51, dejarlo tal cual
        if (telefonoLimpio.startsWith("+51")) {
            return telefonoLimpio;
        }

        // Si empieza con otro código (ej: +52, +1), extraer solo los números y agregar +51
        if (telefonoLimpio.startsWith("+")) {
            // Extraer solo los números después del +
            String soloNumeros = telefonoLimpio.substring(1).replaceAll("\\D", "");
            if (soloNumeros.length() > 0) {
                return "+51" + soloNumeros;
            }
        }

        // Si son solo números (sin +), agregar +51
        String soloNumeros = telefonoLimpio.replaceAll("\\D", "");
        if (soloNumeros.length() > 0) {
            return "+51" + soloNumeros;
        }

        return "+51";
    }
    
    @Override
    public UsuarioResponse mapearAUsuarioResponse(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        
        UsuarioResponse response = new UsuarioResponse();
        response.setIdUsuario(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setApellido(usuario.getApellido());
        response.setEmail(usuario.getEmail());
        response.setUsername(usuario.getUsername());
        response.setTelefono(usuario.getTelefono());
        response.setDireccion(usuario.getDireccion());
        response.setRol(usuario.getRol() != null ? usuario.getRol().toString() : null);
        response.setActivo(usuario.getActivo());
        response.setFechaRegistro(usuario.getFechaRegistro());
        
        return response;
    }
    
    @Override
    public List<UsuarioResponse> obtenerTodosLosUsuariosComoDTO() {
        List<Usuario> usuarios = obtenerTodosLosUsuarios();
        return usuarios.stream()
            .map(this::mapearAUsuarioResponse)
            .collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public UsuarioResponse obtenerUsuarioPorIdComoDTO(Integer id) {
        Usuario usuario = obtenerUsuarioPorId(id);
        if (usuario == null) {
            throw new RecursoNoEncontradoExcepcion("Usuario no encontrado");
        }
        return mapearAUsuarioResponse(usuario);
    }
}
