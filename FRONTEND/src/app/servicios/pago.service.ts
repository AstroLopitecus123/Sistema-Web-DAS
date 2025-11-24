import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentRequest, PaymentResponse } from '../modelos/pago.model';
import { ConfiguracionService } from './configuracion.service';

export interface CrearPedidoRequest {
  idCliente: number;
  totalPedido: number;
  direccionEntrega: string;
  notasCliente?: string;
  metodoPago: 'tarjeta' | 'billetera_virtual' | 'efectivo';
  codigoCupon?: string;
  montoPagadoCliente?: number; 
  productos: {
    idProducto: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    notasPersonalizacion?: string;
  }[];
}

export interface PedidoResponse {
  idPedido: number;
  totalPedido: number;
  direccionEntrega: string;
  metodoPago: string;
  estadoPago: string;
  estadoPedido: string;
  fechaPedido: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = 'http://localhost:8089/api/v1';
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  constructor(
    private http: HttpClient,
    private configuracionService: ConfiguracionService
  ) {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      const stripeConfig = this.configuracionService.getStripeConfig();
      
      if (!stripeConfig.publishableKey.startsWith('pk_test_')) {
        throw new Error('La clave de Stripe no tiene el formato correcto para modo test');
      }
      
      this.stripe = await loadStripe(stripeConfig.publishableKey);
      
      if (!this.stripe) {
        throw new Error('Stripe no se pudo inicializar - verifica tu clave');
      }
      
      console.log('Stripe inicializado correctamente:', this.stripe);
    } catch (error) {
      console.error('Error al inicializar Stripe:', error);
      throw error;
    }
  }

  async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }
    return this.stripe;
  }

  async createCardElement(containerId: string): Promise<StripeCardElement | null> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        console.error('Stripe no está disponible');
        return null;
      }

      this.destroyCardElement();

      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`No se encontró el contenedor #${containerId}`);
        return null;
      }

      if (container.hasChildNodes()) {
        container.innerHTML = '';
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';

      await new Promise(resolve => setTimeout(resolve, 100));

      this.elements = stripe.elements({
        locale: 'es'
      });

      this.cardElement = this.elements.create('card' as any, {
        style: {
          base: {
            fontSize: '16px',
            color: '#30313d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#df1b41',
            iconColor: '#df1b41',
          },
        },
        hidePostalCode: true,
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      this.cardElement.mount(`#${containerId}`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return this.cardElement;
    } catch (error) {
      console.error('Error al crear elemento de tarjeta:', error);
      return null;
    }
  }

  destroyCardElement(): void {
    try {
      if (this.cardElement) {
        this.cardElement.unmount();
        this.cardElement.destroy();
        this.cardElement = null;
      }
      if (this.elements) {
        this.elements = null;
      }
    } catch (error) {
      console.warn('Error al destruir Card Element:', error);
      this.cardElement = null;
      this.elements = null;
    }
  }

  crearPedido(pedidoData: CrearPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/pedidos`, pedidoData);
  }

  crearPaymentIntent(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pagos/crear-intent`, request);
  }

  async confirmarPagoConTarjeta(
    clientSecret: string,
    email: string,
    nombre: string
  ): Promise<{ success: boolean; error?: string; paymentIntentId?: string }> {
    const stripe = await this.getStripe();
    
    if (!stripe || !this.cardElement) {
      return { success: false, error: 'Stripe no está inicializado correctamente' };
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: nombre,
            email: email,
          },
        },
      });

      if (error) {
        console.error('Error al confirmar pago:', error);
        return { success: false, error: error.message };
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Pago exitoso:', paymentIntent.id);
        return { success: true, paymentIntentId: paymentIntent.id };
      }

      return { success: false, error: 'Estado de pago desconocido' };
    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      return { success: false, error: error.message || 'Error desconocido' };
    }
  }

  confirmarPagoEnBackend(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/confirmar/${paymentIntentId}`, {});
  }

  consultarEstadoPago(referenciaTransaccion: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pagos/estado/${referenciaTransaccion}`);
  }

  confirmarPagoManual(idPedido: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/confirmar-manual/${idPedido}`, {});
  }

  async verificarElementoListo(): Promise<boolean> {
    if (!this.cardElement) {
      console.log('No hay elemento de tarjeta');
      return false;
    }

    try {
      const container = document.getElementById('stripe-card-element');
      if (!container) {
        console.log('Contenedor no encontrado');
        return false;
      }

      const inputs = container.querySelectorAll('input');
      const iframes = container.querySelectorAll('iframe');
      
      if (inputs.length > 0 || iframes.length > 0) {
        console.log('Elemento está listo para usar');
        return true;
      } else {
        console.log('No hay elementos interactivos en el contenedor');
        return false;
      }
    } catch (error) {
      console.log('Error al verificar elemento:', error);
      return false;
    }
  }
}