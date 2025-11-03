package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NotificacionCancelacionRequest {

    @JsonProperty("motivo")
    private String motivo;

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}

