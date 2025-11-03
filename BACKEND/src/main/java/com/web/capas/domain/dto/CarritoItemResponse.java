package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

// DTO para respuestas de items en el carrito.
public class CarritoItemResponse {

    @JsonProperty("idCarrito")
    private Integer idCarrito;

    @JsonProperty("idCliente")
    private Integer idCliente;

    @JsonProperty("producto")
    private CarritoProductoResponse producto;

    @JsonProperty("cantidad")
    private Integer cantidad;

    @JsonProperty("notasPersonalizacion")
    private String notasPersonalizacion;

    @JsonProperty("fechaAdicion")
    private LocalDateTime fechaAdicion;

    public Integer getIdCarrito() {
        return idCarrito;
    }

    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public CarritoProductoResponse getProducto() {
        return producto;
    }

    public void setProducto(CarritoProductoResponse producto) {
        this.producto = producto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public String getNotasPersonalizacion() {
        return notasPersonalizacion;
    }

    public void setNotasPersonalizacion(String notasPersonalizacion) {
        this.notasPersonalizacion = notasPersonalizacion;
    }

    public LocalDateTime getFechaAdicion() {
        return fechaAdicion;
    }

    public void setFechaAdicion(LocalDateTime fechaAdicion) {
        this.fechaAdicion = fechaAdicion;
    }
}

