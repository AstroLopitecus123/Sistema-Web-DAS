package com.web.capas.application.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.web.capas.domain.dto.PagoResponse;
import com.web.capas.domain.dto.PaymentRequest;
import com.web.capas.domain.dto.PaymentResponse;
import com.web.capas.domain.RecursoNoEncontradoExcepcion;
import com.web.capas.domain.ServiceException;
import com.web.capas.infrastructure.persistence.entities.Pago;
import com.web.capas.infrastructure.persistence.entities.Pedido;
import com.web.capas.domain.repository.PagoRepository;
import com.web.capas.domain.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PagoServiceImpl implements PagoService {

    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private WhatsAppService whatsAppService;

    @Override
    @Transactional
    public PaymentResponse crearPaymentIntent(PaymentRequest request) {
        try {
            // Validar que el pedido existe
            Pedido pedido = pedidoRepository.findById(request.getIdPedido())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            // Validar que el cliente existe
            if (pedido.getCliente() == null) {
                throw new RecursoNoEncontradoExcepcion("Cliente asociado al pedido no encontrado");
            }
            
            // Validar que el cliente corresponde al email en la request
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                if (!pedido.getCliente().getEmail().equals(request.getEmail())) {
                    throw new ServiceException("El email proporcionado no corresponde al cliente del pedido");
                }
            }
            
            // Convertir a centavos para Stripe
            long amountInCents = request.getMonto()
                .multiply(new BigDecimal("100"))
                .longValue();
            
            Map<String, String> metadata = new HashMap<>();
            metadata.put("id_pedido", request.getIdPedido().toString());
            metadata.put("cliente_email", request.getEmail());
            
            // Crear PaymentIntent en Stripe
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setDescription("Pago por pedido #" + request.getIdPedido())
                .putMetadata("id_pedido", request.getIdPedido().toString())
                .setReceiptEmail(request.getEmail())
                // Solo tarjetas
                .addPaymentMethodType("card")
                .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            // Guardar pago en BD
            Pago pago = new Pago();
            pago.setPedido(pedido);
            pago.setMonto(request.getMonto());
            pago.setMetodoPago(Pago.MetodoPago.tarjeta);
            pago.setEstadoTransaccion(Pago.EstadoTransaccion.pendiente);
            pago.setReferenciaTransaccion(paymentIntent.getId());
            pago.setFechaPago(LocalDateTime.now());
            
            pagoRepository.save(pago);
            
            // Marcar pedido como pendiente
            pedido.setEstadoPago(Pedido.EstadoPago.pendiente);
            pedidoRepository.save(pedido);
            
            // Retornar la respuesta con el client_secret
            return new PaymentResponse(
                paymentIntent.getClientSecret(),
                paymentIntent.getId(),
                paymentIntent.getStatus(),
                "PaymentIntent creado exitosamente"
            );
            
        } catch (StripeException e) {
            throw new ServiceException("Error al crear PaymentIntent en Stripe: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ServiceException("Error al procesar el pago: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Pago confirmarPago(String paymentIntentId) {
        try {
            // Recuperar el PaymentIntent de Stripe
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            // Buscar el pago en la BD
            Pago pago = pagoRepository.findByReferenciaTransaccion(paymentIntentId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pago no encontrado"));
            
            // Verificar resultado de Stripe
            if ("succeeded".equals(paymentIntent.getStatus())) {
                pago.setEstadoTransaccion(Pago.EstadoTransaccion.exitoso);
                
                // Marcar pedido como pagado
                Pedido pedido = pago.getPedido();
                pedido.setEstadoPago(Pedido.EstadoPago.pagado);
                pedidoRepository.save(pedido);
                
                // Enviar notificación WhatsApp
                try {
                    String telefono = pedido.getCliente().getTelefono();
                    String nombreCliente = pedido.getCliente().getNombre();

                    if (telefono != null && !telefono.trim().isEmpty()) {
                        whatsAppService.notificarPedidoConfirmado(telefono, pedido.getIdPedido(), nombreCliente);
                    }
                } catch (Exception e) {
                    System.err.println("Error al enviar WhatsApp de confirmación: " + e.getMessage());
                }
                
            } else if ("requires_payment_method".equals(paymentIntent.getStatus()) || 
                       "canceled".equals(paymentIntent.getStatus())) {
                pago.setEstadoTransaccion(Pago.EstadoTransaccion.fallido);
                
                // Actualizar el estado del pedido
                Pedido pedido = pago.getPedido();
                pedido.setEstadoPago(Pedido.EstadoPago.fallido);
                pedidoRepository.save(pedido);
            }
            
            return pagoRepository.save(pago);
            
        } catch (StripeException e) {
            throw new ServiceException("Error al confirmar pago en Stripe: " + e.getMessage(), e);
        }
    }

    @Override
    public Pago obtenerPagoPorReferencia(String referenciaTransaccion) {
        return pagoRepository.findByReferenciaTransaccion(referenciaTransaccion)
            .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pago no encontrado"));
    }
    
    @Override
    public PagoResponse confirmarPagoComoDTO(String paymentIntentId) {
        Pago pago = confirmarPago(paymentIntentId);
        return mapearAPagoResponse(pago);
    }
    
    @Override
    public PagoResponse obtenerPagoPorReferenciaComoDTO(String referenciaTransaccion) {
        Pago pago = obtenerPagoPorReferencia(referenciaTransaccion);
        return mapearAPagoResponse(pago);
    }
    
    private PagoResponse mapearAPagoResponse(Pago pago) {
        if (pago == null) {
            return null;
        }
        
        PagoResponse response = new PagoResponse();
        response.setIdPago(pago.getIdPago());
        response.setIdPedido(pago.getPedido() != null ? pago.getPedido().getIdPedido() : null);
        response.setMonto(pago.getMonto());
        response.setMetodoPago(pago.getMetodoPago() != null ? pago.getMetodoPago().toString() : null);
        response.setEstadoTransaccion(pago.getEstadoTransaccion() != null ? pago.getEstadoTransaccion().toString() : null);
        response.setReferenciaTransaccion(pago.getReferenciaTransaccion());
        response.setFechaPago(pago.getFechaPago());
        
        return response;
    }

    @Override
    @Transactional
    public Pago confirmarPagoManual(Integer idPedido) {
        try {
            // Buscar el pedido
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            // Verificar que el pedido tenga un método de pago manual
            if (pedido.getMetodoPago() == Pedido.MetodoPago.tarjeta) {
                throw new ServiceException("Este método solo es para pagos manuales (billetera virtual o efectivo)");
            }
            
            // Buscar o crear el pago asociado al pedido
            Pago pago;
            try {
                pago = pagoRepository.findByPedido_IdPedido(idPedido)
                    .orElse(null);
            } catch (Exception e) {
                pago = null;
            }
            
            // Si no existe el pago, crearlo
            if (pago == null) {
                pago = new Pago();
                pago.setPedido(pedido);
                pago.setMonto(pedido.getTotalPedido());
                pago.setMetodoPago(pedido.getMetodoPago() == Pedido.MetodoPago.billetera_virtual ? 
                    Pago.MetodoPago.billetera_virtual : Pago.MetodoPago.efectivo);
                pago.setEstadoTransaccion(Pago.EstadoTransaccion.pendiente);
                pago.setReferenciaTransaccion("MANUAL_" + pedido.getIdPedido());
                pago.setFechaPago(LocalDateTime.now());
            }
            
            // Actualizar el estado del pago
            pago.setEstadoTransaccion(Pago.EstadoTransaccion.exitoso);
            pago.setFechaPago(LocalDateTime.now());
            pago = pagoRepository.save(pago);
            
            // Actualizar el estado del pedido
            pedido.setEstadoPago(Pedido.EstadoPago.pagado);
            pedidoRepository.save(pedido);
            
            // Enviar notificación WhatsApp
            try {
                String telefono = pedido.getCliente().getTelefono();
                String nombreCliente = pedido.getCliente().getNombre();

                if (telefono != null && !telefono.trim().isEmpty()) {
                    whatsAppService.notificarPedidoConfirmado(telefono, pedido.getIdPedido(), nombreCliente);
                }
            } catch (Exception e) {
                System.err.println("Error al enviar WhatsApp de confirmación: " + e.getMessage());
            }
            
            return pago;
            
        } catch (Exception e) {
            System.err.println("Error en confirmarPagoManual: " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al confirmar pago manual: " + e.getMessage(), e);
        }
    }
}
