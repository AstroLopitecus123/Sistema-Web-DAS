import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { PagoService } from '../../servicios/pago.service';
import { AuthService } from '../../servicios/auth.service';
import { ItemCarrito } from '../../modelos/producto.model';
import { NotificacionService } from '../../servicios/notificacion.service';
import { CheckoutService } from '../../servicios/checkout.service';
import { CampoUbicacion } from '../campo-ubicacion/campo-ubicacion';

export interface MetodoPago {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  disponible: boolean;
}

export interface InformacionPago {
  metodoPago: string;
  // Para tarjeta
  numeroTarjeta?: string;
  fechaVencimiento?: string;
  cvv?: string;
  nombreTitular?: string;
  // Para billetera virtual
  numeroTelefono?: string;
  codigoVerificacion?: string;
  // Para efectivo
  montoRecibido?: number;
  // Información general
  direccionEntrega: string;
  notasCliente?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, CampoUbicacion],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout implements OnInit, AfterViewInit, OnDestroy {
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() pagoExitoso = new EventEmitter<void>();

  // Datos del carrito
  items: ItemCarrito[] = [];
  subtotal: number = 0;
  totalItems: number = 0;

  // Opciones de pago
  metodosPago: MetodoPago[] = [
    {
      id: 'tarjeta',
      nombre: 'Tarjeta de Crédito/Débito',
      descripcion: 'Visa, Mastercard, American Express',
      icono: 'fas fa-credit-card',
      disponible: true
    },
    {
      id: 'billetera_virtual',
      nombre: 'Billetera Virtual',
      descripcion: 'Yape, Plin, Bim, Tunki',
      icono: 'fas fa-mobile-alt',
      disponible: true
    },
    {
      id: 'efectivo',
      nombre: 'Efectivo',
      descripcion: 'Pago contra entrega',
      icono: 'fas fa-money-bill-wave',
      disponible: true
    }
  ];

  // Información de pago
  informacionPago: InformacionPago = {
    metodoPago: 'tarjeta',
    direccionEntrega: '',
    notasCliente: ''
  };

  // Estados del proceso
  pasoActual: number = 1; // 1: Pago, 2: Info, 3: Confirmar
  procesandoPago: boolean = false;
  errorPago: string | null = null;

  // Variables para Stripe
  stripeCardElementMontado: boolean = false;
  pedidoIdCreado: number | null = null;

  constructor(
    private carritoService: CarritoService,
    private pagoService: PagoService,
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit(): void {
    this.cargarDatosCarrito();
  }

  ngAfterViewInit(): void {
    // Stripe se monta cuando se necesita
  }

  ngOnDestroy(): void {
    // Limpiar Stripe
    this.pagoService.destroyCardElement();
  }

  cargarDatosCarrito(): void {
    this.items = this.carritoService.getItems();
    this.subtotal = this.carritoService.subtotal();
    this.totalItems = this.carritoService.totalItems();
  }

  seleccionarMetodoPago(metodo: string): void {
    this.informacionPago.metodoPago = metodo;
    this.errorPago = null;
  }

  siguientePaso(): void {
    if (this.pasoActual === 1) {
      if (!this.informacionPago.metodoPago) {
        this.notificacionService.mostrarError(
          'Método de pago requerido', 
          'Por favor selecciona un método de pago'
        );
        return;
      }
      this.pasoActual = 2;
      
      if (this.informacionPago.metodoPago === 'tarjeta') {
        setTimeout(() => this.montarStripeElements(), 300);
      }
    } else if (this.pasoActual === 2) {
      if (!this.validarInformacionPago()) {
        return;
      }
      this.pasoActual = 3;
    }
  }

  private async montarStripeElements(): Promise<void> {
    const container = document.getElementById('stripe-card-element');
    if (!container) {
      console.error('Contenedor stripe-card-element no encontrado');
      setTimeout(() => this.montarStripeElements(), 200);
      return;
    }

    if (container.hasChildNodes()) {
      container.innerHTML = '';
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.stripeCardElementMontado) {
      this.pagoService.destroyCardElement();
      this.stripeCardElementMontado = false;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      const element = await this.pagoService.createCardElement('stripe-card-element');
      
      if (element) {
        setTimeout(() => {
          const containerAfter = document.getElementById('stripe-card-element');
          if (containerAfter && containerAfter.hasChildNodes()) {
            this.stripeCardElementMontado = true;
          } else {
            console.error('Elemento no se montó correctamente');
          }
        }, 1000);
      } else {
        console.error('No se pudo crear el elemento de Stripe');
        this.notificacionService.mostrarError(
          'Error de inicialización', 
          'Error al inicializar el formulario de pago. Intenta de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error al montar Stripe Elements:', error);
      this.notificacionService.mostrarError(
        'Error de inicialización', 
        'Error al inicializar el formulario de pago. Intenta de nuevo.'
      );
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.errorPago = null;
    }
  }

  validarInformacionPago(): boolean {
    if (!this.informacionPago.direccionEntrega.trim()) {
      this.notificacionService.mostrarError(
        'Dirección requerida', 
        'La dirección de entrega es obligatoria'
      );
      return false;
    }

    if (this.informacionPago.metodoPago === 'tarjeta') {
      // Stripe se encarga de la validación
      if (!this.stripeCardElementMontado) {
        this.notificacionService.mostrarError(
          'Formulario no listo', 
          'Error: El formulario de pago no está listo'
        );
        return false;
      }
    } else if (this.informacionPago.metodoPago === 'billetera_virtual') {
      if (!this.informacionPago.numeroTelefono) {
        this.notificacionService.mostrarError(
          'Teléfono requerido', 
          'El número de teléfono es obligatorio para billetera virtual'
        );
        return false;
      }
    } else if (this.informacionPago.metodoPago === 'efectivo') {
      if (!this.informacionPago.montoRecibido || this.informacionPago.montoRecibido < this.subtotal) {
        this.notificacionService.mostrarError(
          'Monto insuficiente', 
          `El monto recibido debe ser mayor o igual a S/. ${this.subtotal.toFixed(2)}`
        );
        return false;
      }
    }

    this.errorPago = null;
    return true;
  }

  async procesarPago(): Promise<void> {
    if (this.procesandoPago) {
      return;
    }

    this.procesandoPago = true;
    this.errorPago = null;

    try {
      //Crear el pedido en el backend (para todos los métodos de pago)
      const pedidoCreado = await this.crearPedidoEnBackend();
      if (!pedidoCreado) {
        throw new Error('No se pudo crear el pedido');
      }

      // Procesar pago según el método elegido
      if (this.informacionPago.metodoPago === 'tarjeta') {
        await this.procesarPagoConStripe(pedidoCreado.idPedido);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.procesandoPago = false;

      setTimeout(() => {
        this.notificacionService.mostrarExito(
          '¡Pago exitoso!', 
          'Tu pedido ha sido procesado correctamente'
        );
      }, 100);

      this.carritoService.vaciarCarrito();
      this.pagoExitoso.emit();

      this.cerrarModal();

      // Redirigir a la página de mis pedidos
      this.router.navigate(['/mis-pedidos']);

    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      this.notificacionService.mostrarError(
        'Error de pago', 
        error.message || 'Error al procesar el pago. Inténtalo de nuevo.'
      );
      this.procesandoPago = false;
      
      // Si hubo error con tarjeta, volver al paso 2 para reintentar
      if (this.informacionPago.metodoPago === 'tarjeta') {
        this.pasoActual = 2;
        // NO destruir - el elemento ya está ahí, solo mostrar el error
      }
    }
  }

  // Crea el pedido en el backend
  private async crearPedidoEnBackend(): Promise<any> {
    const datosPedido = this.checkoutService.crearDatosPedido(
      this.items,
      this.subtotal,
      this.informacionPago.direccionEntrega,
      this.informacionPago.notasCliente || '',
      this.informacionPago.metodoPago as 'tarjeta' | 'billetera_virtual' | 'efectivo'
    );

    const response = await this.checkoutService.crearPedidoEnBackend(datosPedido);
    this.pedidoIdCreado = response.idPedido;
    return response;
  }

  // Procesa el pago con Stripe
  private async procesarPagoConStripe(idPedido: number): Promise<void> {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Paso 1: Generar PaymentIntent en el backend
      const paymentResponse = await new Promise<any>((resolve, reject) => {
        this.pagoService.crearPaymentIntent({
          idPedido: idPedido,
          monto: this.subtotal,
          email: usuario.email
        }).subscribe({
          next: (response) => resolve(response),
          error: (error) => reject(error)
        });
      });

      if (!paymentResponse || !paymentResponse.clientSecret) {
        throw new Error('No se pudo crear el PaymentIntent');
      }

      const resultado = await this.pagoService.confirmarPagoConTarjeta(
        paymentResponse.clientSecret,
        usuario.email,
        `${usuario.nombre} ${usuario.apellido}`
      );

      if (!resultado.success) {
        throw new Error(resultado.error || 'Error al procesar el pago');
      }

      await new Promise<void>((resolve, reject) => {
        this.pagoService.confirmarPagoEnBackend(resultado.paymentIntentId!).subscribe({
          next: () => {
            resolve();
          },
          error: (error) => {
            console.error('Error al confirmar en backend:', error);
            // No rechazamos porque el pago ya se procesó en Stripe
            resolve();
          }
        });
      });

    } catch (error: any) {
      console.error('Error en procesarPagoConStripe:', error);
      throw error;
    }
  }

  private async confirmarPagoManual(idPedido: number): Promise<void> {
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
      
    } catch (error: any) {
      console.error('Error en confirmarPagoManual:', error);
      throw error;
    }
  }

  cerrarModal(): void {
    // Limpiar Stripe Elements solo al cerrar completamente
    if (this.stripeCardElementMontado) {
      this.pagoService.destroyCardElement();
      this.stripeCardElementMontado = false;
    }
    
    // Restablecer el paso actual
    this.pasoActual = 1;
    this.errorPago = null;
    this.procesandoPago = false;
    
    this.cerrar.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  formatearNumeroTarjeta(event: any): void {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    event.target.value = formattedValue;
    this.informacionPago.numeroTarjeta = formattedValue;
  }

  formatearFechaVencimiento(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.informacionPago.fechaVencimiento = value;
  }

  calcularVuelto(): number {
    if (this.informacionPago.metodoPago === 'efectivo' && this.informacionPago.montoRecibido) {
      return this.informacionPago.montoRecibido - this.subtotal;
    }
    return 0;
  }

  obtenerNombreMetodoPago(): string {
    const metodo = this.metodosPago.find(m => m.id === this.informacionPago.metodoPago);
    return metodo ? metodo.nombre : 'Método no seleccionado';
  }

}
