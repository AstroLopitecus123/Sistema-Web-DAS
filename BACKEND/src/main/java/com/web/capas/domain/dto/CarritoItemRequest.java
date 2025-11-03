package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// DTO para operaciones de creación o actualización de items en el carrito.
public class CarritoItemRequest {

    @JsonProperty("idCliente")
    private Integer idCliente;

    @JsonProperty("idProducto")
    private Integer idProducto;

    @JsonProperty("cantidad")
    private Integer cantidad;

    @JsonProperty("notasPersonalizacion")
    private String notasPersonalizacion;

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
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
}

