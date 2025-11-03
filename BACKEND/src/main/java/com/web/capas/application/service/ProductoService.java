package com.web.capas.application.service;

import com.web.capas.domain.dto.ProductoRequest;
import com.web.capas.domain.dto.ProductoResponse;
import java.util.List;

public interface ProductoService {

    List<ProductoResponse> obtenerProductosActivos();

    List<ProductoResponse> obtenerMenuDisponible();

    List<ProductoResponse> buscarProductos(String keyword);

    ProductoResponse guardarProducto(ProductoRequest request);
}
