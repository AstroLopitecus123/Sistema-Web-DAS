package com.web.capas.infrastructure.persistence.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.time.LocalDateTime;

@Entity
@Table(name = "Metodos_Pago_Inhabilitados")
public class MetodoPagoInhabilitado {

    public enum MetodoPago {
        tarjeta, billetera_virtual, efectivo
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inhabilitacion")
    private Integer idInhabilitacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "fecha_inhabilitacion", nullable = false)
    private LocalDateTime fechaInhabilitacion;

    @Column(name = "razon", length = 255)
    private String razon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reactivado_por_admin")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Usuario reactivadoPorAdmin;

    @Column(name = "fecha_reactivacion")
    private LocalDateTime fechaReactivacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    public Integer getIdInhabilitacion() {
        return idInhabilitacion;
    }

    public void setIdInhabilitacion(Integer idInhabilitacion) {
        this.idInhabilitacion = idInhabilitacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public LocalDateTime getFechaInhabilitacion() {
        return fechaInhabilitacion;
    }

    public void setFechaInhabilitacion(LocalDateTime fechaInhabilitacion) {
        this.fechaInhabilitacion = fechaInhabilitacion;
    }

    public String getRazon() {
        return razon;
    }

    public void setRazon(String razon) {
        this.razon = razon;
    }

    public Usuario getReactivadoPorAdmin() {
        return reactivadoPorAdmin;
    }

    public void setReactivadoPorAdmin(Usuario reactivadoPorAdmin) {
        this.reactivadoPorAdmin = reactivadoPorAdmin;
    }

    public LocalDateTime getFechaReactivacion() {
        return fechaReactivacion;
    }

    public void setFechaReactivacion(LocalDateTime fechaReactivacion) {
        this.fechaReactivacion = fechaReactivacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}

