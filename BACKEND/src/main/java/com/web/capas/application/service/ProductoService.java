package com.web.capas.application.service;

import com.web.capas.infrastructure.persistence.entities.Producto;
import java.util.List;

public interface ProductoService {

    public List<Producto> obtenerProductosActivos();
    
	public List<Producto> obtenerMenuDisponible();

	public List<Producto> buscarProductos(String keyword);

	public Producto guardarProducto(Producto producto);
}
