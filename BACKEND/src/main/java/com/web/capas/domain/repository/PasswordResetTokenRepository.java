package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.PasswordResetToken;
import com.web.capas.infrastructure.persistence.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    
    // Busca un token de recuperación por su valor
    Optional<PasswordResetToken> findByToken(String token);
    
    // Busca tokens de un usuario que no hayan sido usados
    Optional<PasswordResetToken> findByUsuarioAndUsadoFalse(Usuario usuario);
    
    // Elimina todos los tokens expirados
    @Transactional
    @Modifying
    void deleteByFechaExpiracionBefore(LocalDateTime fecha);
    
    // Elimina todos los tokens de un usuario
    @Transactional
    @Modifying
    void deleteByUsuario(Usuario usuario);
    
    // Elimina todos los tokens de un usuario por ID
    @Transactional
    @Modifying
    void deleteByUsuario_IdUsuario(Integer idUsuario);
}
