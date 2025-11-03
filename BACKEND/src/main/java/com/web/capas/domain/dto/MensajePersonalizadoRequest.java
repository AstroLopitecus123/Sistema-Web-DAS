package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MensajePersonalizadoRequest {

    @JsonProperty("telefono")
    private String telefono;

    @JsonProperty("mensaje")
    private String mensaje;

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}

