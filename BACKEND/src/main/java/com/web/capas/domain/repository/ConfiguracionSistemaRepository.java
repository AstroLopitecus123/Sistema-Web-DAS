package com.web.capas.domain.repository;

import com.web.capas.infrastructure.persistence.entities.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema, Integer> {
    
    Optional<ConfiguracionSistema> findByClave(String clave);
}

