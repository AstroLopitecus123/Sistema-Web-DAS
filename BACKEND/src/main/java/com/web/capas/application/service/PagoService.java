package com.web.capas.application.service;

import com.web.capas.domain.dto.PagoResponse;
import com.web.capas.domain.dto.PaymentRequest;
import com.web.capas.domain.dto.PaymentResponse;
import com.web.capas.infrastructure.persistence.entities.Pago;

public interface PagoService {
    
    // Crear un PaymentIntent en Stripe
    PaymentResponse crearPaymentIntent(PaymentRequest request);
    
    // Confirmar el pago después de que el cliente complete el proceso
    Pago confirmarPago(String paymentIntentId);
    
    // Confirmar el pago y devolver como DTO
    PagoResponse confirmarPagoComoDTO(String paymentIntentId);
    
    // Obtener estado del pago
    Pago obtenerPagoPorReferencia(String referenciaTransaccion);
    
    // Obtener estado del pago como DTO
    PagoResponse obtenerPagoPorReferenciaComoDTO(String referenciaTransaccion);
    
    // Confirmar pago manual (billetera virtual y efectivo)
    Pago confirmarPagoManual(Integer idPedido);
}
