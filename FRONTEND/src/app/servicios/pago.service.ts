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

  /**
   * Inicializa Stripe con la clave pública
   */
  private async initializeStripe(): Promise<void> {
    try {
      const stripeConfig = this.configuracionService.getStripeConfig();
      console.log('🔧 Inicializando Stripe con clave:', stripeConfig.publishableKey.substring(0, 20) + '...');
      
      // Verificar que la clave tenga el formato correcto
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

  /**
   * Obtiene la instancia de Stripe
   */
  async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }
    return this.stripe;
  }

  /**
   * Crea un Stripe Elements para el formulario de tarjeta
   */
  async createCardElement(containerId: string): Promise<StripeCardElement | null> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        console.error('Stripe no está disponible');
        return null;
      }

      console.log('Creando elemento de tarjeta con nuevo enfoque');

      // Destruir elemento anterior
      this.destroyCardElement();

      // Verificar contenedor
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`No se encontró el contenedor #${containerId}`);
        return null;
      }

      // SOLUCIÓN: Verificar que el contenedor no tenga elementos hijos antes de montar
      if (container.hasChildNodes()) {
        console.log('Contenedor tiene elementos hijos - limpiando...');
        container.innerHTML = '';
        // Esperar a que se limpie completamente
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Asegurar propiedades CSS
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';

      // Esperar un poco para que el DOM se estabilice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generar elementos con configuración básica
      this.elements = stripe.elements({
        locale: 'es'
      });

      console.log('Stripe Elements creado');

      // Generar elemento de tarjeta con configuración básica
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

      console.log('Card Element creado');

      await new Promise(resolve => setTimeout(resolve, 50));
      this.cardElement.mount(`#${containerId}`);
      
      // Esperar a que se renderice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Elemento de tarjeta montado con nuevo enfoque');
      
      // Verificar que realmente se montó
      const inputs = container.querySelectorAll('input');
      const iframes = container.querySelectorAll('iframe');
      console.log('Verificación final - Inputs:', inputs.length, 'Iframes:', iframes.length);
      
      return this.cardElement;
    } catch (error) {
      console.error('Error al crear elemento de tarjeta:', error);
      return null;
    }
  }

  /**
   * Destruye el elemento de tarjeta
   */
  destroyCardElement(): void {
    try {
      if (this.cardElement) {
        this.cardElement.unmount();
        this.cardElement.destroy();
        this.cardElement = null;
        console.log('Card Element destruido');
      }
      if (this.elements) {
        this.elements = null;
      }
    } catch (error) {
      console.warn('Error al destruir Card Element:', error);
      // Forzar limpieza incluso si hay error
      this.cardElement = null;
      this.elements = null;
    }
  }

  /**
   * PASO 1: Crear un pedido en el backend
   */
  crearPedido(pedidoData: CrearPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/pedidos`, pedidoData);
  }

  /**
   * PASO 2: Crear un PaymentIntent en Stripe (a través del backend)
   */
  crearPaymentIntent(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pagos/crear-intent`, request);
  }

  /**
   * PASO 3: Confirmar el pago con Stripe Elements
   */
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

  /**
   * PASO 4: Confirmar el pago en el backend (actualizar estado)
   */
  confirmarPagoEnBackend(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/confirmar/${paymentIntentId}`, {});
  }

  /**
   * Consultar estado de un pago
   */
  consultarEstadoPago(referenciaTransaccion: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pagos/estado/${referenciaTransaccion}`);
  }

  /**
   * Confirmar pago manual (billetera virtual y efectivo)
   */
  confirmarPagoManual(idPedido: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos/confirmar-manual/${idPedido}`, {});
  }

  /**
   * Verifica si el elemento de tarjeta está listo
   */
  async verificarElementoListo(): Promise<boolean> {
    if (!this.cardElement) {
      console.log('No hay elemento de tarjeta');
      return false;
    }

    try {
      // Verificar que el elemento existe y está montado
      const container = document.getElementById('stripe-card-element');
      if (!container) {
        console.log('Contenedor no encontrado');
        return false;
      }

      // Verificar que hay elementos dentro del contenedor
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