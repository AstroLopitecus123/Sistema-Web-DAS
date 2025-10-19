package com.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// DTO para operaciones de usuario (login, registro, perfil, etc.)
public class UsuarioRequest {

    // Campos para registro
    @JsonProperty("nombre")
    private String nombre;

    @JsonProperty("apellido")
    private String apellido;

    @JsonProperty("email")
    private String email;

    @JsonProperty("contrasena")
    private String contrasena;

    @JsonProperty("telefono")
    private String telefono;

    @JsonProperty("direccion")
    private String direccion;

    // Campos para cambio de contraseña
    @JsonProperty("contrasenaActual")
    private String contrasenaActual;

    @JsonProperty("nuevaContrasena")
    private String nuevaContrasena;

    @JsonProperty("idUsuario")
    private Integer idUsuario;

    // Campos para recuperación de contraseña
    @JsonProperty("token")
    private String token;


    public UsuarioRequest() {}

    public UsuarioRequest(String nombre, String apellido, String email, String contrasena, 
                         String telefono, String direccion) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.contrasena = contrasena;
        this.telefono = telefono;
        this.direccion = direccion;
    }

    public UsuarioRequest(String email, String contrasena) {
        this.email = email;
        this.contrasena = contrasena;
    }

    public UsuarioRequest(Integer idUsuario, String contrasenaActual, String nuevaContrasena) {
        this.idUsuario = idUsuario;
        this.contrasenaActual = contrasenaActual;
        this.nuevaContrasena = nuevaContrasena;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getContrasenaActual() {
        return contrasenaActual;
    }

    public void setContrasenaActual(String contrasenaActual) {
        this.contrasenaActual = contrasenaActual;
    }

    public String getNuevaContrasena() {
        return nuevaContrasena;
    }

    public void setNuevaContrasena(String nuevaContrasena) {
        this.nuevaContrasena = nuevaContrasena;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    // Métodos de utilidad

    // Verifica si el request es para registro
    public boolean esRegistro() {
        return nombre != null && apellido != null && email != null && contrasena != null;
    }

    // Verifica si el request es para login
    public boolean esLogin() {
        return email != null && contrasena != null && nombre == null;
    }

    // Verifica si el request es para cambio de contraseña
    public boolean esCambioContrasena() {
        return idUsuario != null && contrasenaActual != null && nuevaContrasena != null;
    }

    // Verifica si el request es para actualización de perfil
    public boolean esActualizacionPerfil() {
        return idUsuario != null && (nombre != null || apellido != null || telefono != null || direccion != null);
    }

    // Verifica si el request es para recuperación de contraseña
    public boolean esRecuperacionContrasena() {
        return email != null && contrasena == null && token == null;
    }

    // Verifica si el request es para restablecer contraseña
    public boolean esRestablecerContrasena() {
        return token != null && nuevaContrasena != null;
    }

    @Override
    public String toString() {
        return "UsuarioRequest{" +
                "nombre='" + nombre + '\'' +
                ", apellido='" + apellido + '\'' +
                ", email='" + email + '\'' +
                ", telefono='" + telefono + '\'' +
                ", direccion='" + direccion + '\'' +
                ", idUsuario=" + idUsuario +
                '}';
    }
}
