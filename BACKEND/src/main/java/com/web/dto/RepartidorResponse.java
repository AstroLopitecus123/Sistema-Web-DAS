package com.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para la respuesta de información del repartidor
 * Contiene los datos básicos del repartidor asignado a un pedido
 */
public class RepartidorResponse {
    
    @JsonProperty("idRepartidor")
    private Integer idRepartidor;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("apellido")
    private String apellido;
    
    @JsonProperty("telefono")
    private String telefono;
    
    public RepartidorResponse() {
    }
    
    public RepartidorResponse(Integer idRepartidor, String nombre, String apellido, String telefono) {
        this.idRepartidor = idRepartidor;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
    }

    public Integer getIdRepartidor() {
        return idRepartidor;
    }

    public void setIdRepartidor(Integer idRepartidor) {
        this.idRepartidor = idRepartidor;
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
