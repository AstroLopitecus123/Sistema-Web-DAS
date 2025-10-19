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
  imports: [CommonModule, FormsModule],
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
      
      // Montar Stripe Elements si se seleccionó tarjeta
      if (this.informacionPago.metodoPago === 'tarjeta') {
        // Esperar más tiempo para asegurar que el DOM esté listo
        setTimeout(() => this.montarStripeElements(), 300);
      }
    } else if (this.pasoActual === 2) {
      if (!this.validarInformacionPago()) {
        return;
      }
      this.pasoActual = 3;
    }
  }

  /**
   * Monta el elemento de tarjeta de Stripe
   */
  private async montarStripeElements(): Promise<void> {
    console.log('Implementando solución ngAfterViewInit...');
    
    const container = document.getElementById('stripe-card-element');
    if (!container) {
      console.error('Contenedor stripe-card-element no encontrado');
      setTimeout(() => this.montarStripeElements(), 200);
      return;
    }

    // Verificar que el contenedor no tenga elementos hijos
    if (container.hasChildNodes()) {
      console.log('Contenedor ya tiene elementos hijos - limpiando...');
      container.innerHTML = '';
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Destruir el elemento anterior si existe
    if (this.stripeCardElementMontado) {
      console.log('Destruyendo elemento anterior...');
      this.pagoService.destroyCardElement();
      this.stripeCardElementMontado = false;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      console.log('Creando nuevo elemento de Stripe con verificación hasChildNodes...');
      const element = await this.pagoService.createCardElement('stripe-card-element');
      
      if (element) {
        setTimeout(() => {
          const containerAfter = document.getElementById('stripe-card-element');
          if (containerAfter && containerAfter.hasChildNodes()) {
            console.log('Elemento montado correctamente');
            this.stripeCardElementMontado = true;
            console.log('Stripe Elements completamente funcional');
          } else {
            console.error('Elemento no se montó - no tiene elementos hijos');
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
    // Evitar procesamiento múltiple
    if (this.procesandoPago) {
      console.log('Pago ya en proceso, ignorando llamada duplicada');
      return;
    }

    console.log('Iniciando procesamiento de pago...');
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
        // Para efectivo y billetera virtual, el pago ya está confirmado en el backend
        console.log('Pago manual confirmado (billetera virtual/efectivo)');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Pago procesado exitosamente');
      this.procesandoPago = false;

      // Mostrar notificación de éxito con un pequeño delay
      setTimeout(() => {
        this.notificacionService.mostrarExito(
          '¡Pago exitoso!', 
          'Tu pedido ha sido procesado correctamente'
        );
      }, 100);

      // El pedido fue creado exitosamente en backend
      console.log('🧾 Pedido creado exitosamente en backend');

      // Vaciar el carrito
      this.carritoService.vaciarCarrito();
      console.log('🛒 Carrito vaciado');

      // Emitir evento después de mostrar la notificación
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

  /**
   * Crea el pedido en el backend
   */
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

  /**
   * Procesa el pago con Stripe
   */
  private async procesarPagoConStripe(idPedido: number): Promise<void> {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Paso 1: Generar PaymentIntent en el backend
      console.log('💳 Creando PaymentIntent en Stripe...');
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

      console.log('PaymentIntent creado:', paymentResponse.paymentIntentId);

      // Paso 2: Confirmar el pago con Stripe Elements
      console.log('Confirmando pago con Stripe...');
      const resultado = await this.pagoService.confirmarPagoConTarjeta(
        paymentResponse.clientSecret,
        usuario.email,
        `${usuario.nombre} ${usuario.apellido}`
      );

      if (!resultado.success) {
        throw new Error(resultado.error || 'Error al procesar el pago');
      }

      console.log('Pago confirmado en Stripe:', resultado.paymentIntentId);

      // Paso 3: Confirmar el pago en el backend
      console.log('Actualizando estado del pago en backend...');
      await new Promise<void>((resolve, reject) => {
        this.pagoService.confirmarPagoEnBackend(resultado.paymentIntentId!).subscribe({
          next: () => {
            console.log('Pago confirmado en backend');
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

  /**
   * Confirma pago manual para billetera virtual y efectivo
   */
  private async confirmarPagoManual(idPedido: number): Promise<void> {
    try {
      console.log('Confirmando pago manual para pedido:', idPedido);
      
      // Para pagos manuales (efectivo/billetera virtual), el pago se confirma automáticamente
      // en el backend durante la creación del pedido, no necesitamos llamada adicional
      console.log('Pago manual confirmado automáticamente en backend');
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000); // Simular delay
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
