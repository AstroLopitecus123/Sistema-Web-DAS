package com.web.capas.infrastructure.persistence.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Cupones")
public class Cupon {

    public enum TipoDescuento {
        porcentaje, monto_fijo
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cupon")
    private Integer idCupon;

    @Column(name = "codigo", nullable = false, unique = true, length = 50)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_descuento", nullable = false)
    private TipoDescuento tipoDescuento;

    @Column(name = "valor_descuento", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDescuento;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "cantidad_disponible")
    private Integer cantidadDisponible;

    @Column(name = "usos_maximos_por_usuario")
    private Integer usosMaximosPorUsuario = 1;

    @Column(name = "monto_minimo_compra", precision = 10, scale = 2)
    private BigDecimal montoMinimoCompra = BigDecimal.ZERO;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creado_por_admin", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario creadoPorAdmin;

    public Integer getIdCupon() {
        return idCupon;
    }

    public void setIdCupon(Integer idCupon) {
        this.idCupon = idCupon;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public TipoDescuento getTipoDescuento() {
        return tipoDescuento;
    }

    public void setTipoDescuento(TipoDescuento tipoDescuento) {
        this.tipoDescuento = tipoDescuento;
    }

    public BigDecimal getValorDescuento() {
        return valorDescuento;
    }

    public void setValorDescuento(BigDecimal valorDescuento) {
        this.valorDescuento = valorDescuento;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Integer getCantidadDisponible() {
        return cantidadDisponible;
    }

    public void setCantidadDisponible(Integer cantidadDisponible) {
        this.cantidadDisponible = cantidadDisponible;
    }

    public Integer getUsosMaximosPorUsuario() {
        return usosMaximosPorUsuario;
    }

    public void setUsosMaximosPorUsuario(Integer usosMaximosPorUsuario) {
        this.usosMaximosPorUsuario = usosMaximosPorUsuario != null && usosMaximosPorUsuario > 0 
            ? usosMaximosPorUsuario : 1;
    }

    public BigDecimal getMontoMinimoCompra() {
        return montoMinimoCompra;
    }

    public void setMontoMinimoCompra(BigDecimal montoMinimoCompra) {
        this.montoMinimoCompra = montoMinimoCompra != null ? montoMinimoCompra : BigDecimal.ZERO;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo != null ? activo : true;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Usuario getCreadoPorAdmin() {
        return creadoPorAdmin;
    }

    public void setCreadoPorAdmin(Usuario creadoPorAdmin) {
        this.creadoPorAdmin = creadoPorAdmin;
    }
}

