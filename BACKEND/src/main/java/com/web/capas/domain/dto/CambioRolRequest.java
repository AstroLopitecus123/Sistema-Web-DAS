package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CambioRolRequest {

    @JsonProperty("rol")
    private String rol;

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}

