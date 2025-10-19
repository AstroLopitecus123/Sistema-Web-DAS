package com.web.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.web.dto.PaymentRequest;
import com.web.dto.PaymentResponse;
import com.web.exception.RecursoNoEncontradoExcepcion;
import com.web.exception.ServiceException;
import com.web.model.Pago;
import com.web.repository.PagoRepository;
import com.web.model.Pedido;
import com.web.repository.PedidoRepository;
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
            System.out.println("PagoService: Iniciando creación de PaymentIntent...");
            System.out.println("Request recibido: " + request);
            
            // Validar que el pedido existe
            Pedido pedido = pedidoRepository.findById(request.getIdPedido())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
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
                .setCurrency("usd") // Puedes cambiarlo a "pen" para soles
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
                        System.out.println("WhatsApp de confirmación enviado a: " + telefono);
                    } else {
                        System.out.println("Cliente sin teléfono registrado para notificación WhatsApp.");
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
    @Transactional
    public Pago confirmarPagoManual(Integer idPedido) {
        try {
            System.out.println("Iniciando confirmación de pago manual para pedido: " + idPedido);
            
            // Buscar el pedido
            Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
            
            System.out.println("Pedido encontrado: " + pedido.getIdPedido() + ", Método: " + pedido.getMetodoPago());
            
            // Verificar que el pedido tenga un método de pago manual
            if (pedido.getMetodoPago() == Pedido.MetodoPago.tarjeta) {
                throw new ServiceException("Este método solo es para pagos manuales (billetera virtual o efectivo)");
            }
            
            // Buscar o crear el pago asociado al pedido
            Pago pago;
            try {
                System.out.println("Buscando pago existente para pedido: " + idPedido);
                pago = pagoRepository.findByPedido_IdPedido(idPedido)
                    .orElse(null);
            } catch (Exception e) {
                System.out.println("No se encontró pago existente, creando uno nuevo: " + e.getMessage());
                pago = null;
            }
            
            // Si no existe el pago, crearlo
            if (pago == null) {
                System.out.println("Creando nuevo registro de pago...");
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
            System.out.println("Actualizando estado del pago...");
            pago.setEstadoTransaccion(Pago.EstadoTransaccion.exitoso);
            pago.setFechaPago(LocalDateTime.now());
            pago = pagoRepository.save(pago);
            
            // Actualizar el estado del pedido
            System.out.println("Actualizando estado del pedido...");
            pedido.setEstadoPago(Pedido.EstadoPago.pagado);
            pedidoRepository.save(pedido);
            
            // Enviar notificación WhatsApp
            try {
                System.out.println("Enviando notificación WhatsApp...");
                String telefono = pedido.getCliente().getTelefono();
                String nombreCliente = pedido.getCliente().getNombre();

                if (telefono != null && !telefono.trim().isEmpty()) {
                    whatsAppService.notificarPedidoConfirmado(telefono, pedido.getIdPedido(), nombreCliente);
                    System.out.println("WhatsApp de confirmación enviado a: " + telefono);
                } else {
                    System.out.println("Cliente sin teléfono registrado para notificación WhatsApp.");
                }
            } catch (Exception e) {
                System.err.println("Error al enviar WhatsApp de confirmación: " + e.getMessage());
            }
            
            System.out.println("Confirmación de pago manual completada exitosamente");
            return pago;
            
        } catch (Exception e) {
            System.err.println("Error en confirmarPagoManual: " + e.getMessage());
            e.printStackTrace();
            throw new ServiceException("Error al confirmar pago manual: " + e.getMessage(), e);
        }
    }
}
