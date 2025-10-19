package com.web.dto;

import java.math.BigDecimal;

public class PedidoResponse {
    
    private Integer idPedido;
    private BigDecimal totalPedido;
    private String direccionEntrega;
    private String metodoPago;
    private String estadoPago;
    private String estadoPedido;
    private String fechaPedido;
    
    public PedidoResponse() {
    }
    
    public PedidoResponse(Integer idPedido, BigDecimal totalPedido, String direccionEntrega, 
                         String metodoPago, String estadoPago, String estadoPedido, String fechaPedido) {
        this.idPedido = idPedido;
        this.totalPedido = totalPedido;
        this.direccionEntrega = direccionEntrega;
        this.metodoPago = metodoPago;
        this.estadoPago = estadoPago;
        this.estadoPedido = estadoPedido;
        this.fechaPedido = fechaPedido;
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
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

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(String estadoPedido) {
        this.estadoPedido = estadoPedido;
    }

    public String getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(String fechaPedido) {
        this.fechaPedido = fechaPedido;
    }
}
