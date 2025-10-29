package com.web.capas.domain.model;

import java.time.LocalDateTime;

public class Carrito {

    private Integer idCarrito;
    private Usuario cliente;
    private Producto producto;
    private Integer cantidad;
    private String notasPersonalizacion;
    private LocalDateTime fechaAdicion;

    public Carrito() {}

    public Carrito(Usuario cliente, Producto producto, Integer cantidad) {
        this.cliente = cliente;
        this.producto = producto;
        this.cantidad = cantidad;
        this.fechaAdicion = LocalDateTime.now();
    }

    public Integer getIdCarrito() {
        return idCarrito;
    }

    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
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

    // Métodos de utilidad
    public boolean tieneNotasPersonalizacion() {
        return notasPersonalizacion != null && !notasPersonalizacion.trim().isEmpty();
    }

    @Override
    public String toString() {
        return "Carrito{" +
                "idCarrito=" + idCarrito +
                ", cliente=" + (cliente != null ? cliente.getEmail() : "null") +
                ", producto=" + (producto != null ? producto.getNombre() : "null") +
                ", cantidad=" + cantidad +
                ", notasPersonalizacion='" + notasPersonalizacion + '\'' +
                ", fechaAdicion=" + fechaAdicion +
                '}';
    }
}