package com.web.capas.infrastructure.persistence.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reportes")
public class Reporte {

    public enum TipoReporte {
        ventas, productos_vendidos, ganancias
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Integer idReporte;

    @Column(name = "nombre_reporte", nullable = false, length = 100)
    private String nombreReporte;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_reporte", nullable = false)
    private TipoReporte tipoReporte;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "generado_por_admin", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario generadoPorAdmin;

    @Column(name = "fecha_inicio_param")
    private LocalDate fechaInicioParam;

    @Column(name = "fecha_fin_param")
    private LocalDate fechaFinParam;

    public Integer getIdReporte() {
        return idReporte;
    }

    public void setIdReporte(Integer idReporte) {
        this.idReporte = idReporte;
    }

    public String getNombreReporte() {
        return nombreReporte;
    }

    public void setNombreReporte(String nombreReporte) {
        this.nombreReporte = nombreReporte;
    }

    public TipoReporte getTipoReporte() {
        return tipoReporte;
    }

    public void setTipoReporte(TipoReporte tipoReporte) {
        this.tipoReporte = tipoReporte;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }

    public Usuario getGeneradoPorAdmin() {
        return generadoPorAdmin;
    }

    public void setGeneradoPorAdmin(Usuario generadoPorAdmin) {
        this.generadoPorAdmin = generadoPorAdmin;
    }

    public LocalDate getFechaInicioParam() {
        return fechaInicioParam;
    }

    public void setFechaInicioParam(LocalDate fechaInicioParam) {
        this.fechaInicioParam = fechaInicioParam;
    }

    public LocalDate getFechaFinParam() {
        return fechaFinParam;
    }

    public void setFechaFinParam(LocalDate fechaFinParam) {
        this.fechaFinParam = fechaFinParam;
    }
}

