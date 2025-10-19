package com.web.repository;

import com.web.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // Buscar usuario por correo
    Optional<Usuario> findByEmail(String email);
    
    // Verificar si existe correo
    boolean existsByEmail(String email);
    
    // Contar usuarios activos
    long countByActivoTrue();
    
    // Contar usuarios por rol
    long countByRol(Usuario.Rol rol);
}
