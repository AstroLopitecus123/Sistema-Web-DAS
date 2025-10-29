package com.web.capas.application.service;

import com.web.capas.domain.dto.PaymentRequest;
import com.web.capas.domain.dto.PaymentResponse;
import com.web.capas.infrastructure.persistence.entities.Pago;

public interface PagoService {
    
    // Crear un PaymentIntent en Stripe
    PaymentResponse crearPaymentIntent(PaymentRequest request);
    
    // Confirmar el pago después de que el cliente complete el proceso
    Pago confirmarPago(String paymentIntentId);
    
    // Obtener estado del pago
    Pago obtenerPagoPorReferencia(String referenciaTransaccion);
    
    // Confirmar pago manual (billetera virtual y efectivo)
    Pago confirmarPagoManual(Integer idPedido);
}
