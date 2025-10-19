package com.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/**
 * DTO para productos dentro de un pedido
 */
public class ProductoPedidoRequest {
    
    @JsonProperty("idProducto")
    private Integer idProducto;

    @JsonProperty("nombre")
    private String nombre;

    @JsonProperty("cantidad")
    private Integer cantidad;

    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;

    @JsonProperty("subtotal")
    private BigDecimal subtotal;

    @JsonProperty("notasPersonalizacion")
    private String notasPersonalizacion;
    
    public ProductoPedidoRequest() {
    }
    
    public ProductoPedidoRequest(Integer idProducto, String nombre, Integer cantidad, 
                                BigDecimal precioUnitario, BigDecimal subtotal, String notasPersonalizacion) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
        this.notasPersonalizacion = notasPersonalizacion;
    }

    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getNotasPersonalizacion() {
        return notasPersonalizacion;
    }

    public void setNotasPersonalizacion(String notasPersonalizacion) {
        this.notasPersonalizacion = notasPersonalizacion;
    }

    @Override
    public String toString() {
        return "ProductoPedidoRequest{" +
                "idProducto=" + idProducto +
                ", nombre='" + nombre + '\'' +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", subtotal=" + subtotal +
                '}';
    }
}
