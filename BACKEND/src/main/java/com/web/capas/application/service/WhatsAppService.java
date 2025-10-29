package com.web.capas.application.service;

public interface WhatsAppService {
    
    // Envía notificación de pedido confirmado
    void notificarPedidoConfirmado(String telefono, Integer idPedido, String nombreCliente);
    
    // Envía notificación de pedido en camino
    boolean notificarPedidoEnCamino(String telefono, Integer idPedido, String nombreCliente, String direccion);
    
    // Envía notificación de pedido entregado
    boolean notificarPedidoEntregado(String telefono, Integer idPedido, String nombreCliente);
    
    // Envía notificación de pedido cancelado
    boolean notificarPedidoCancelado(String telefono, Integer idPedido, String nombreCliente, String motivo);
    
    // Envía mensaje personalizado
    boolean enviarMensaje(String telefono, String mensaje);
}
