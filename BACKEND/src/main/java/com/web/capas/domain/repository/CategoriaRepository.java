package com.web.capas.domain.repository;

import com.web.capas.domain.model.Categoria;
import java.util.List;
import java.util.Optional;

public interface CategoriaRepository {
    
    List<Categoria> findAll();
    Optional<Categoria> findById(Integer id);
    Categoria save(Categoria categoria);
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
