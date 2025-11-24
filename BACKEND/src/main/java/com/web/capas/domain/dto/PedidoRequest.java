package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

public class PedidoRequest {

    @JsonProperty("idCliente")
    private Integer idCliente;

    @JsonProperty("totalPedido")
    private BigDecimal totalPedido;

    @JsonProperty("direccionEntrega")
    private String direccionEntrega;

    @JsonProperty("notasCliente")
    private String notasCliente;

    @JsonProperty("metodoPago")
    private String metodoPago; 

    @JsonProperty("productos")
    private List<ProductoPedidoRequest> productos;

    @JsonProperty("codigoCupon")
    private String codigoCupon;

    @JsonProperty("montoPagadoCliente")
    private BigDecimal montoPagadoCliente;

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

    @JsonProperty("idPedido")
    private Integer idPedido;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("notasRepartidor")
    private String notasRepartidor;

    public PedidoRequest() {}

    public PedidoRequest(Integer idCliente, BigDecimal totalPedido, String direccionEntrega, 
                        String notasCliente, String metodoPago, List<ProductoPedidoRequest> productos) {
        this.idCliente = idCliente;
        this.totalPedido = totalPedido;
        this.direccionEntrega = direccionEntrega;
        this.notasCliente = notasCliente;
        this.metodoPago = metodoPago;
        this.productos = productos;
    }

    public PedidoRequest(Integer idProducto, String nombre, Integer cantidad, 
                        BigDecimal precioUnitario, BigDecimal subtotal, String notasPersonalizacion) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
        this.notasPersonalizacion = notasPersonalizacion;
    }

    public PedidoRequest(Integer idPedido, String estado, String notasRepartidor) {
        this.idPedido = idPedido;
        this.estado = estado;
        this.notasRepartidor = notasRepartidor;
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public BigDecimal getTotalPedido() {
        return totalPedido;
    }

    public void setTotalPedido(BigDecimal totalPedido) {
        this.totalPedido = totalPedido;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getNotasCliente() {
        return notasCliente;
    }

    public void setNotasCliente(String notasCliente) {
        this.notasCliente = notasCliente;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public List<ProductoPedidoRequest> getProductos() {
        return productos;
    }

    public void setProductos(List<ProductoPedidoRequest> productos) {
        this.productos = productos;
    }

    public String getCodigoCupon() {
        return codigoCupon;
    }

    public void setCodigoCupon(String codigoCupon) {
        this.codigoCupon = codigoCupon;
    }

    public BigDecimal getMontoPagadoCliente() {
        return montoPagadoCliente;
    }

    public void setMontoPagadoCliente(BigDecimal montoPagadoCliente) {
        this.montoPagadoCliente = montoPagadoCliente;
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

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNotasRepartidor() {
        return notasRepartidor;
    }

    public void setNotasRepartidor(String notasRepartidor) {
        this.notasRepartidor = notasRepartidor;
    }

    public boolean esCrearPedido() {
        return idCliente != null && totalPedido != null && productos != null;
    }

    public boolean esActualizarPedido() {
        return idPedido != null && estado != null;
    }

    public boolean esProductoPedido() {
        return idProducto != null && cantidad != null && precioUnitario != null;
    }

    @Override
    public String toString() {
        return "PedidoRequest{" +
                "idCliente=" + idCliente +
                ", totalPedido=" + totalPedido +
                ", direccionEntrega='" + direccionEntrega + '\'' +
                ", metodoPago='" + metodoPago + '\'' +
                ", idPedido=" + idPedido +
                ", estado='" + estado + '\'' +
                '}';
    }
}
