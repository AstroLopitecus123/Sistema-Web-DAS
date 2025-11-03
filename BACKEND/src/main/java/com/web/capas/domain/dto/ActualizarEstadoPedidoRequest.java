package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ActualizarEstadoPedidoRequest {

    @JsonProperty("nuevoEstado")
    private String nuevoEstado;

    @JsonProperty("notas")
    private String notas;

    public String getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(String nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
}

