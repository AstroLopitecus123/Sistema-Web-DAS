package com.web.capas.domain.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private AuthData data;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, AuthData data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AuthData getData() {
        return data;
    }

    public void setData(AuthData data) {
        this.data = data;
    }

    // Clase interna para los datos del usuario
    public static class AuthData {
        private String token;
        private Integer idUsuario;
        private String nombre;
        private String apellido;
        private String email;
        private String username;
        private String telefono;
        private String direccion;
        private String rol;

        public AuthData() {}

        public AuthData(String token, Integer idUsuario, String nombre, String apellido, String email, String username, String telefono, String direccion, String rol) {
            this.token = token;
            this.idUsuario = idUsuario;
            this.nombre = nombre;
            this.apellido = apellido;
            this.email = email;
            this.username = username;
            this.telefono = telefono;
            this.direccion = direccion;
            this.rol = rol;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
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

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
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

        public String getRol() {
            return rol;
        }

        public void setRol(String rol) {
            this.rol = rol;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}
