package com.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

/**
 * DTO para la respuesta de detalle de producto en un pedido
 * Contiene la información completa de un producto dentro de un pedido
 */
public class ProductoDetalleResponse {
    
    @JsonProperty("idDetallePedido")
    private Integer idDetallePedido;
    
    @JsonProperty("idProducto")
    private Integer idProducto;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("descripcion")
    private String descripcion;
    
    @JsonProperty("cantidad")
    private Integer cantidad;
    
    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;
    
    @JsonProperty("subtotal")
    private BigDecimal subtotal;
    
    @JsonProperty("notasPersonalizacion")
    private String notasPersonalizacion;
    
    @JsonProperty("imagenUrl")
    private String imagenUrl;
    
    @JsonProperty("categoria")
    private String categoria;
    
    public ProductoDetalleResponse() {
    }
    
    public ProductoDetalleResponse(Integer idDetallePedido, Integer idProducto, String nombre,
                                  String descripcion, Integer cantidad, BigDecimal precioUnitario,
                                  BigDecimal subtotal, String notasPersonalizacion, String imagenUrl,
                                  String categoria) {
        this.idDetallePedido = idDetallePedido;
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
        this.notasPersonalizacion = notasPersonalizacion;
        this.imagenUrl = imagenUrl;
        this.categoria = categoria;
    }

    public Integer getIdDetallePedido() {
        return idDetallePedido;
    }

    public void setIdDetallePedido(Integer idDetallePedido) {
        this.idDetallePedido = idDetallePedido;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
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

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}
