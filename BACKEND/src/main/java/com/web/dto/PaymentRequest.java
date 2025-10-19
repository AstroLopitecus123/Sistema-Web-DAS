package com.web.dto;

import java.math.BigDecimal;

public class PaymentRequest {
    
    private Integer idPedido;
    private BigDecimal monto;
    private String email; // Correo del cliente para Stripe
    
    public PaymentRequest() {
    }
    
    public PaymentRequest(Integer idPedido, BigDecimal monto, String email) {
        this.idPedido = idPedido;
        this.monto = monto;
        this.email = email;
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
