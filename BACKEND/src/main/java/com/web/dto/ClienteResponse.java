package com.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para la respuesta de información del cliente
 * Contiene los datos básicos del cliente en un pedido
 */
public class ClienteResponse {
    
    @JsonProperty("idUsuario")
    private Integer idUsuario;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("apellido")
    private String apellido;
    
    @JsonProperty("telefono")
    private String telefono;
    
    public ClienteResponse() {
    }
    
    public ClienteResponse(Integer idUsuario, String nombre, String apellido, String telefono) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
