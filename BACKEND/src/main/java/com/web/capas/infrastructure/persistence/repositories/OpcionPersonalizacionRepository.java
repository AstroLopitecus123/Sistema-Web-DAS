package com.web.capas.infrastructure.persistence.repositories;

import com.web.capas.infrastructure.persistence.entities.OpcionPersonalizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OpcionPersonalizacionRepository extends JpaRepository<OpcionPersonalizacion, Integer> {
    
    // Métodos específicos de negocio
    List<OpcionPersonalizacion> findByProducto_IdProductoAndActivaTrue(Integer idProducto);
    List<OpcionPersonalizacion> findByActivaTrue();
}
