package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReporteProblemaResponse {

    @JsonProperty("idPedido")
    private Integer idPedido;

    @JsonProperty("clienteNombre")
    private String clienteNombre;

    @JsonProperty("clienteTelefono")
    private String clienteTelefono;

    @JsonProperty("detalleProblema")
    private String detalleProblema;

    @JsonProperty("repartidorNombre")
    private String repartidorNombre;

    @JsonProperty("estadoPedido")
    private String estadoPedido;

    @JsonProperty("fechaProblema")
    private String fechaProblema;

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getClienteTelefono() {
        return clienteTelefono;
    }

    public void setClienteTelefono(String clienteTelefono) {
        this.clienteTelefono = clienteTelefono;
    }

    public String getDetalleProblema() {
        return detalleProblema;
    }

    public void setDetalleProblema(String detalleProblema) {
        this.detalleProblema = detalleProblema;
    }

    public String getRepartidorNombre() {
        return repartidorNombre;
    }

    public void setRepartidorNombre(String repartidorNombre) {
        this.repartidorNombre = repartidorNombre;
    }

    public String getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(String estadoPedido) {
        this.estadoPedido = estadoPedido;
    }

    public String getFechaProblema() {
        return fechaProblema;
    }

    public void setFechaProblema(String fechaProblema) {
        this.fechaProblema = fechaProblema;
    }
}

