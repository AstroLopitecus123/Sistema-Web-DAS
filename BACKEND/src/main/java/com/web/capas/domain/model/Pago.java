package com.web.capas.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Pago {

    public enum MetodoPago {
        tarjeta, billetera_virtual, efectivo 
    }

    public enum EstadoTransaccion {
        exitoso, fallido, pendiente
    }

    private Integer idPago;
    private com.web.capas.infrastructure.persistence.entities.Pedido pedido;
    private BigDecimal monto;
    private MetodoPago metodoPago;
    private EstadoTransaccion estadoTransaccion;
    private LocalDateTime fechaPago;
    private String referenciaTransaccion;

    public Pago() {}

    public Pago(com.web.capas.infrastructure.persistence.entities.Pedido pedido, BigDecimal monto, MetodoPago metodoPago) {
        this.pedido = pedido;
        this.monto = monto;
        this.metodoPago = metodoPago;
        this.estadoTransaccion = EstadoTransaccion.pendiente;
        this.fechaPago = LocalDateTime.now();
    }

    public Integer getIdPago() {
        return idPago;
    }

    public void setIdPago(Integer idPago) {
        this.idPago = idPago;
    }

    public com.web.capas.infrastructure.persistence.entities.Pedido getPedido() {
        return pedido;
    }

    public void setPedido(com.web.capas.infrastructure.persistence.entities.Pedido pedido) {
        this.pedido = pedido;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public EstadoTransaccion getEstadoTransaccion() {
        return estadoTransaccion;
    }

    public void setEstadoTransaccion(EstadoTransaccion estadoTransaccion) {
        this.estadoTransaccion = estadoTransaccion;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getReferenciaTransaccion() {
        return referenciaTransaccion;
    }

    public void setReferenciaTransaccion(String referenciaTransaccion) {
        this.referenciaTransaccion = referenciaTransaccion;
    }

    // Métodos de utilidad
    public boolean esExitoso() {
        return estadoTransaccion == EstadoTransaccion.exitoso;
    }

    public boolean esFallido() {
        return estadoTransaccion == EstadoTransaccion.fallido;
    }

    public boolean estaPendiente() {
        return estadoTransaccion == EstadoTransaccion.pendiente;
    }

    public boolean tieneReferenciaTransaccion() {
        return referenciaTransaccion != null && !referenciaTransaccion.trim().isEmpty();
    }

    @Override
    public String toString() {
        return "Pago{" +
                "idPago=" + idPago +
                ", pedido=" + (pedido != null ? pedido.getIdPedido() : "null") +
                ", monto=" + monto +
                ", metodoPago=" + metodoPago +
                ", estadoTransaccion=" + estadoTransaccion +
                ", fechaPago=" + fechaPago +
                ", referenciaTransaccion='" + referenciaTransaccion + '\'' +
                '}';
    }
}