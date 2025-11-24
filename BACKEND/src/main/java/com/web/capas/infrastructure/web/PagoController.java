package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.PagoResponse;
import com.web.capas.domain.dto.PaymentRequest;
import com.web.capas.domain.dto.PaymentResponse;
import com.web.capas.application.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @PostMapping("/crear-intent")
    public ResponseEntity<PaymentResponse> crearPaymentIntent(@RequestBody PaymentRequest request) {
        PaymentResponse response = pagoService.crearPaymentIntent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirmar/{paymentIntentId}")
    public ResponseEntity<PagoResponse> confirmarPago(@PathVariable String paymentIntentId) {
        PagoResponse pago = pagoService.confirmarPagoComoDTO(paymentIntentId);
        return ResponseEntity.ok(pago);
    }

    @GetMapping("/estado/{referenciaTransaccion}")
    public ResponseEntity<PagoResponse> obtenerEstadoPago(@PathVariable String referenciaTransaccion) {
        PagoResponse pago = pagoService.obtenerPagoPorReferenciaComoDTO(referenciaTransaccion);
        return ResponseEntity.ok(pago);
    }

}
