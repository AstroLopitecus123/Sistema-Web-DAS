package com.web.capas.application.service;

import com.web.capas.domain.dto.CarritoItemRequest;
import com.web.capas.domain.dto.CarritoItemResponse;
import java.util.List;

public interface CarritoService {

    List<CarritoItemResponse> obtenerCarritoDelCliente(Integer idCliente);

    CarritoItemResponse agregarItem(CarritoItemRequest request);

    CarritoItemResponse actualizarItem(Integer idCarrito, CarritoItemRequest request);

    void eliminarItem(Integer idCarrito, Integer idCliente);

    void vaciarCarrito(Integer idCliente);
}

