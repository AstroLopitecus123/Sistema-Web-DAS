package com.web.service;

import com.web.model.Producto;
import java.util.List;

public interface ProductoService {

    public List<Producto> obtenerProductosActivos();
    
	public List<Producto> obtenerMenuDisponible();

	public List<Producto> buscarProductos(String keyword);

	public Producto guardarProducto(Producto producto);
}
