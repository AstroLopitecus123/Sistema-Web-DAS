package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CuponRequest {

    @JsonProperty("codigo")
    private String codigo;

    @JsonProperty("tipoDescuento")
    private String tipoDescuento;

    @JsonProperty("valorDescuento")
    private BigDecimal valorDescuento;

    @JsonProperty("fechaInicio")
    private LocalDate fechaInicio;

    @JsonProperty("fechaFin")
    private LocalDate fechaFin;

    @JsonProperty("cantidadDisponible")
    private Integer cantidadDisponible;

    @JsonProperty("usosMaximosPorUsuario")
    private Integer usosMaximosPorUsuario;

    @JsonProperty("montoMinimoCompra")
    private BigDecimal montoMinimoCompra;

    @JsonProperty("activo")
    private Boolean activo;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getTipoDescuento() {
        return tipoDescuento;
    }

    public void setTipoDescuento(String tipoDescuento) {
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
        this.usosMaximosPorUsuario = usosMaximosPorUsuario;
    }

    public BigDecimal getMontoMinimoCompra() {
        return montoMinimoCompra;
    }

    public void setMontoMinimoCompra(BigDecimal montoMinimoCompra) {
        this.montoMinimoCompra = montoMinimoCompra;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}

