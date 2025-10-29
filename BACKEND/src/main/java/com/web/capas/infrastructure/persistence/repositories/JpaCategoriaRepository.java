package com.web.capas.infrastructure.persistence.repositories;

import com.web.capas.infrastructure.persistence.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaCategoriaRepository extends JpaRepository<Categoria, Integer> {
    
}
