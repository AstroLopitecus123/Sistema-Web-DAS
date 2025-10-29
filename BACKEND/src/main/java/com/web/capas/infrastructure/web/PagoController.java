package com.web.capas.infrastructure.web;

import com.web.capas.domain.dto.PaymentRequest;
import com.web.capas.domain.dto.PaymentResponse;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.infrastructure.persistence.entities.Pago;
import com.web.capas.application.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    // CU (CLIENTE): CREAR PAYMENT INTENT
    // POST /api/v1/pagos/crear-intent
    @PostMapping("/crear-intent")
    public ResponseEntity<PaymentResponse> crearPaymentIntent(@RequestBody PaymentRequest request) {
        try {
            PaymentResponse response = pagoService.crearPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // CU (CLIENTE): CONFIRMAR PAGO DESPUÉS DE STRIPE
    // POST /api/v1/pagos/confirmar/{paymentIntentId}
    @PostMapping("/confirmar/{paymentIntentId}")
    public ResponseEntity<Pago> confirmarPago(@PathVariable String paymentIntentId) {
        Pago pago = pagoService.confirmarPago(paymentIntentId);
        
        if (pago == null) {
            throw new RecursoNoEncontradoExcepcion("Pago no encontrado");
        }
        
        return ResponseEntity.ok(pago);
    }

    // CU (ADMINISTRADOR/CLIENTE): CONSULTAR ESTADO DE PAGO
    // GET /api/v1/pagos/estado/{referenciaTransaccion}
    @GetMapping("/estado/{referenciaTransaccion}")
    public ResponseEntity<Pago> obtenerEstadoPago(@PathVariable String referenciaTransaccion) {
        Pago pago = pagoService.obtenerPagoPorReferencia(referenciaTransaccion);
        return ResponseEntity.ok(pago);
    }

}
