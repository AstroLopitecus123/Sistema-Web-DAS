package com.web.capas.application.proxy;

import com.web.capas.application.service.WhatsAppService;
import com.web.capas.application.service.WhatsAppServiceImpl;
import com.web.capas.application.singleton.NotificacionConfiguracion;
import com.web.capas.domain.ServiceException;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

// Proxy que valida datos y reintenta antes de usar el servicio real.
@Service
@Primary
public class WhatsAppServiceProxy implements WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppServiceProxy.class);

    private final WhatsAppServiceImpl delegate;
    private final NotificacionConfiguracion configuracion = NotificacionConfiguracion.getInstance();

    public WhatsAppServiceProxy(@Qualifier("whatsAppServiceImpl") WhatsAppServiceImpl delegate) {
        this.delegate = delegate;
    }

    @Override
    public void notificarPedidoConfirmado(String telefono, Integer idPedido, String nombreCliente) {
        ejecutarConReintentos(() -> delegate.notificarPedidoConfirmado(validarTelefono(telefono), idPedido, nombreCliente));
    }

    @Override
    public boolean notificarPedidoEnCamino(String telefono, Integer idPedido, String nombreCliente, String direccion) {
        return ejecutarConReintentos(() -> delegate.notificarPedidoEnCamino(validarTelefono(telefono), idPedido, nombreCliente, direccion));
    }

    @Override
    public boolean notificarPedidoEntregado(String telefono, Integer idPedido, String nombreCliente) {
        return ejecutarConReintentos(() -> delegate.notificarPedidoEntregado(validarTelefono(telefono), idPedido, nombreCliente));
    }

    @Override
    public boolean notificarPedidoCancelado(String telefono, Integer idPedido, String nombreCliente, String motivo) {
        return ejecutarConReintentos(() -> delegate.notificarPedidoCancelado(validarTelefono(telefono), idPedido, nombreCliente, motivo));
    }

    @Override
    public boolean enviarMensaje(String telefono, String mensaje) {
        if (mensaje == null || mensaje.trim().isEmpty()) {
            throw new ServiceException("El mensaje no puede estar vacío");
        }
        return ejecutarConReintentos(() -> delegate.enviarMensaje(validarTelefono(telefono), mensaje));
    }

    private String validarTelefono(String telefono) {
        if (telefono == null || telefono.trim().isEmpty()) {
            throw new ServiceException("El teléfono es obligatorio para enviar un WhatsApp");
        }
        if (!telefono.startsWith("+")) {
            throw new ServiceException("El número debe incluir el código de país (+51...)");
        }
        return telefono.trim();
    }

    private <T> T ejecutarConReintentos(Operacion<T> operacion) {
        int maximoReintentos = configuracion.getMaximoReintentos();
        Duration espera = configuracion.getTiempoEsperaEntreReintentos();

        RuntimeException ultimoError = null;
        for (int intento = 1; intento <= maximoReintentos; intento++) {
            try {
                return operacion.ejecutar();
            } catch (RuntimeException e) {
                ultimoError = e;
                logger.warn("Intento {} de {} fallido enviando WhatsApp: {}", intento, maximoReintentos, e.getMessage());
                dormir(espera);
            }
        }

        if (ultimoError != null) {
            throw ultimoError;
        }
        return null;
    }

    private void ejecutarConReintentos(OperacionSinResultado operacion) {
        ejecutarConReintentos(() -> {
            operacion.ejecutar();
            return null;
        });
    }

    private void dormir(Duration espera) {
        if (espera == null || espera.isZero() || espera.isNegative()) {
            return;
        }
        try {
            Thread.sleep(espera.toMillis());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    @FunctionalInterface
    private interface Operacion<T> {
        T ejecutar();
    }

    @FunctionalInterface
    private interface OperacionSinResultado {
        void ejecutar();
    }
}

