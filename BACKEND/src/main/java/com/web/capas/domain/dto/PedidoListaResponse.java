package com.web.capas.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

// DTO para respuesta de lista de pedidos
public class PedidoListaResponse {
    
    @JsonProperty("idPedido")
    private Integer idPedido;
    
    @JsonProperty("fechaPedido")
    private String fechaPedido;
    
    @JsonProperty("estadoPedido")
    private String estadoPedido;
    
    @JsonProperty("totalPedido")
    private BigDecimal totalPedido;
    
    @JsonProperty("direccionEntrega")
    private String direccionEntrega;
    
    @JsonProperty("notasCliente")
    private String notasCliente;
    
    @JsonProperty("metodoPago")
    private String metodoPago;
    
    @JsonProperty("estadoPago")
    private String estadoPago;
    
    @JsonProperty("fechaEntrega")
    private String fechaEntrega;
    
    @JsonProperty("productos")
    private List<ProductoDetalleResponse> productos;
    
    @JsonProperty("cliente")
    private ClienteResponse cliente;
    
    @JsonProperty("repartidor")
    private RepartidorResponse repartidor;
    
    @JsonProperty("problemaReportado")
    private Boolean problemaReportado;
    
    @JsonProperty("detalleProblema")
    private String detalleProblema;
    
    @JsonProperty("fechaProblema")
    private String fechaProblema;
    
    public PedidoListaResponse() {
    }
    
    public PedidoListaResponse(Integer idPedido, String fechaPedido, String estadoPedido, 
                              BigDecimal totalPedido, String direccionEntrega, String notasCliente,
                              String metodoPago, String estadoPago, String fechaEntrega,
                              List<ProductoDetalleResponse> productos, ClienteResponse cliente,
                              RepartidorResponse repartidor, Boolean problemaReportado,
                              String detalleProblema, String fechaProblema) {
        this.idPedido = idPedido;
        this.fechaPedido = fechaPedido;
        this.estadoPedido = estadoPedido;
        this.totalPedido = totalPedido;
        this.direccionEntrega = direccionEntrega;
        this.notasCliente = notasCliente;
        this.metodoPago = metodoPago;
        this.estadoPago = estadoPago;
        this.fechaEntrega = fechaEntrega;
        this.productos = productos;
        this.cliente = cliente;
        this.repartidor = repartidor;
        this.problemaReportado = problemaReportado;
        this.detalleProblema = detalleProblema;
        this.fechaProblema = fechaProblema;
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public String getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(String fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public String getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(String estadoPedido) {
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

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(String fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public List<ProductoDetalleResponse> getProductos() {
        return productos;
    }

    public void setProductos(List<ProductoDetalleResponse> productos) {
        this.productos = productos;
    }

    public ClienteResponse getCliente() {
        return cliente;
    }

    public void setCliente(ClienteResponse cliente) {
        this.cliente = cliente;
    }

    public RepartidorResponse getRepartidor() {
        return repartidor;
    }

    public void setRepartidor(RepartidorResponse repartidor) {
        this.repartidor = repartidor;
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

    public String getFechaProblema() {
        return fechaProblema;
    }

    public void setFechaProblema(String fechaProblema) {
        this.fechaProblema = fechaProblema;
    }
}
