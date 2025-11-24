package com.web.capas.infrastructure.persistence.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Pedidos")
public class Pedido {

    public enum EstadoPedido {
        pendiente, aceptado, en_preparacion, en_camino, entregado, cancelado
    }

    public enum MetodoPago {
        tarjeta, billetera_virtual, efectivo
    }

    public enum EstadoPago {
        pendiente, pagado, fallido, reembolsado
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Integer idPedido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private com.web.capas.infrastructure.persistence.entities.Usuario cliente;

    @Column(name = "fecha_pedido")
    private LocalDateTime fechaPedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pedido", nullable = false)
    private EstadoPedido estadoPedido;

    @Column(name = "total_pedido", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPedido;

    @Column(name = "direccion_entrega", nullable = false)
    private String direccionEntrega;

    @Column(name = "notas_cliente", columnDefinition = "TEXT")
    private String notasCliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_repartidor")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private com.web.capas.infrastructure.persistence.entities.Usuario repartidor;


    @Column(name = "descuento_aplicado", precision = 10, scale = 2)
    private BigDecimal descuentoAplicado;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false)
    private EstadoPago estadoPago;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<com.web.capas.infrastructure.persistence.entities.DetallePedido> productos;

    @Column(name = "problema_reportado")
    private Boolean problemaReportado = Boolean.FALSE;

    @Column(name = "detalle_problema", columnDefinition = "TEXT")
    private String detalleProblema;

    @Column(name = "fecha_problema")
    private LocalDateTime fechaProblema;

    @Column(name = "pago_efectivo_confirmado_cliente")
    private Boolean pagoEfectivoConfirmadoPorCliente = Boolean.FALSE;

    @Column(name = "pago_efectivo_confirmado_repartidor")
    private Boolean pagoEfectivoConfirmadoPorRepartidor = Boolean.FALSE;

    @Column(name = "fecha_confirmacion_pago_cliente")
    private LocalDateTime fechaConfirmacionPagoCliente;

    @Column(name = "fecha_confirmacion_pago_repartidor")
    private LocalDateTime fechaConfirmacionPagoRepartidor;

    @Column(name = "monto_pagado_cliente", precision = 10, scale = 2)
    private BigDecimal montoPagadoCliente;

    @Column(name = "codigo_cupon", length = 50)
    private String codigoCupon;

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }


    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public LocalDateTime getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDateTime fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public EstadoPedido getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(EstadoPedido estadoPedido) {
        this.estadoPedido = estadoPedido;
    }

    public BigDecimal getTotalPedido() {
        return totalPedido;
    }

    public void setTotalPedido(BigDecimal totalPedido) {
        this.totalPedido = totalPedido;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getNotasCliente() {
        return notasCliente;
    }

    public void setNotasCliente(String notasCliente) {
        this.notasCliente = notasCliente;
    }

    public Usuario getRepartidor() {
        return repartidor;
    }

    public void setRepartidor(Usuario repartidor) {
        this.repartidor = repartidor;
    }


    public BigDecimal getDescuentoAplicado() {
        return descuentoAplicado;
    }

    public void setDescuentoAplicado(BigDecimal descuentoAplicado) {
        this.descuentoAplicado = descuentoAplicado;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public EstadoPago getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(EstadoPago estadoPago) {
        this.estadoPago = estadoPago;
    }

    public LocalDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public List<DetallePedido> getProductos() {
        return productos;
    }

    public void setProductos(List<DetallePedido> productos) {
        this.productos = productos;
    }

    public Boolean getProblemaReportado() {
        return problemaReportado;
    }

    public void setProblemaReportado(Boolean problemaReportado) {
        this.problemaReportado = problemaReportado;
    }

    public String getDetalleProblema() {
        return detalleProblema;
    }

    public void setDetalleProblema(String detalleProblema) {
        this.detalleProblema = detalleProblema;
    }

    public LocalDateTime getFechaProblema() {
        return fechaProblema;
    }

    public void setFechaProblema(LocalDateTime fechaProblema) {
        this.fechaProblema = fechaProblema;
    }

    public Boolean getPagoEfectivoConfirmadoPorCliente() {
        return pagoEfectivoConfirmadoPorCliente;
    }

    public void setPagoEfectivoConfirmadoPorCliente(Boolean pagoEfectivoConfirmadoPorCliente) {
        this.pagoEfectivoConfirmadoPorCliente = pagoEfectivoConfirmadoPorCliente;
    }

    public Boolean getPagoEfectivoConfirmadoPorRepartidor() {
        return pagoEfectivoConfirmadoPorRepartidor;
    }

    public void setPagoEfectivoConfirmadoPorRepartidor(Boolean pagoEfectivoConfirmadoPorRepartidor) {
        this.pagoEfectivoConfirmadoPorRepartidor = pagoEfectivoConfirmadoPorRepartidor;
    }

    public LocalDateTime getFechaConfirmacionPagoCliente() {
        return fechaConfirmacionPagoCliente;
    }

    public void setFechaConfirmacionPagoCliente(LocalDateTime fechaConfirmacionPagoCliente) {
        this.fechaConfirmacionPagoCliente = fechaConfirmacionPagoCliente;
    }

    public LocalDateTime getFechaConfirmacionPagoRepartidor() {
        return fechaConfirmacionPagoRepartidor;
    }

    public void setFechaConfirmacionPagoRepartidor(LocalDateTime fechaConfirmacionPagoRepartidor) {
        this.fechaConfirmacionPagoRepartidor = fechaConfirmacionPagoRepartidor;
    }

    public BigDecimal getMontoPagadoCliente() {
        return montoPagadoCliente;
    }

    public void setMontoPagadoCliente(BigDecimal montoPagadoCliente) {
        this.montoPagadoCliente = montoPagadoCliente;
    }

    public String getCodigoCupon() {
        return codigoCupon;
    }

    public void setCodigoCupon(String codigoCupon) {
        this.codigoCupon = codigoCupon;
    }
}
