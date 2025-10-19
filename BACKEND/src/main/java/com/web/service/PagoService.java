package com.web.service;

import com.web.dto.PaymentRequest;
import com.web.dto.PaymentResponse;
import com.web.model.Pago;

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
