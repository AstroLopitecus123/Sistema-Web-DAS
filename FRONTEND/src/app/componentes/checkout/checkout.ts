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
import { CuponesService } from '../../servicios/cupones.service';

export interface MetodoPago {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  disponible: boolean;
}

export interface InformacionPago {
  metodoPago: string;
  numeroTarjeta?: string;
  fechaVencimiento?: string;
  cvv?: string;
  nombreTitular?: string;
  numeroTelefono?: string;
  codigoVerificacion?: string;
  montoRecibido?: number;
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

  items: ItemCarrito[] = [];
  subtotal: number = 0;
  subtotalSinDescuento: number = 0;
  totalItems: number = 0;
  
  codigoCupon: string = '';
  cuponAplicado: boolean = false;
  descuentoAplicado: number = 0;
  mensajeCupon: string = '';
  validandoCupon: boolean = false;

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

  informacionPago: InformacionPago = {
    metodoPago: 'tarjeta',
    direccionEntrega: '',
    notasCliente: ''
  };

  pasoActual: number = 1;
  procesandoPago: boolean = false;
  errorPago: string | null = null;

  stripeCardElementMontado: boolean = false;
  pedidoIdCreado: number | null = null;

  constructor(
    private carritoService: CarritoService,
    private pagoService: PagoService,
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService,
    private checkoutService: CheckoutService,
    private cuponesService: CuponesService
  ) {}

  ngOnInit(): void {
    this.cargarDatosCarrito();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.pagoService.destroyCardElement();
  }

  cargarDatosCarrito(): void {
    this.items = this.carritoService.getItems();
    this.subtotalSinDescuento = this.carritoService.subtotal();
    this.subtotal = this.subtotalSinDescuento;
    this.totalItems = this.carritoService.totalItems();
  }
  
  validarCupon(): void {
    if (!this.codigoCupon || this.codigoCupon.trim() === '') {
      return;
    }
  }
  
  aplicarCupon(): void {
    if (!this.codigoCupon || this.codigoCupon.trim() === '') {
      this.notificacionService.mostrarError('Código requerido', 'Por favor ingresa un código de cupón');
      return;
    }
    
    this.validandoCupon = true;
    this.mensajeCupon = '';
    
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      this.validandoCupon = false;
      return;
    }
    
    this.cuponesService.obtenerCuponesDisponibles(usuario.idUsuario).subscribe({
      next: (cupones) => {
        const cupon = cupones.find(c => c.codigo.toUpperCase() === this.codigoCupon.trim().toUpperCase());
        
        if (!cupon) {
          this.mensajeCupon = 'Cupón no encontrado o no disponible';
          this.cuponAplicado = false;
          this.descuentoAplicado = 0;
          this.subtotal = this.subtotalSinDescuento;
          this.validandoCupon = false;
          return;
        }
        
        if (cupon.montoMinimo > 0 && this.subtotalSinDescuento < cupon.montoMinimo) {
          this.mensajeCupon = `El cupón requiere un monto mínimo de S/ ${cupon.montoMinimo}`;
          this.cuponAplicado = false;
          this.descuentoAplicado = 0;
          this.subtotal = this.subtotalSinDescuento;
          this.validandoCupon = false;
        return;
      }
      
      let descuento = 0;
        if (cupon.tipoDescuento === 'porcentaje') {
          descuento = (this.subtotalSinDescuento * cupon.valorDescuento) / 100;
        } else {
          descuento = cupon.valorDescuento;
          if (descuento > this.subtotalSinDescuento) {
            descuento = this.subtotalSinDescuento;
          }
        }
        
        this.descuentoAplicado = descuento;
        this.subtotal = Math.max(0, this.subtotalSinDescuento - descuento);
        this.cuponAplicado = true;
        this.mensajeCupon = `Cupón "${cupon.codigo}" aplicado correctamente`;
        this.validandoCupon = false;
        
        this.notificacionService.mostrarExito('Cupón aplicado', `Descuento de S/ ${descuento.toFixed(2)} aplicado`);
      },
      error: (err) => {
        console.error('Error al validar cupón:', err);
        this.mensajeCupon = 'Error al validar el cupón. Inténtalo de nuevo.';
        this.cuponAplicado = false;
        this.descuentoAplicado = 0;
        this.subtotal = this.subtotalSinDescuento;
        this.validandoCupon = false;
      }
    });
  }
  
  quitarCupon(): void {
    this.codigoCupon = '';
    this.cuponAplicado = false;
    this.descuentoAplicado = 0;
    this.mensajeCupon = '';
    this.subtotal = this.subtotalSinDescuento;
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
      this.subtotalSinDescuento, // Enviar subtotal sin descuento, el backend aplicará el cupón
      this.informacionPago.direccionEntrega,
      this.informacionPago.notasCliente || '',
      this.informacionPago.metodoPago as 'tarjeta' | 'billetera_virtual' | 'efectivo',
      this.cuponAplicado ? this.codigoCupon.trim().toUpperCase() : undefined,
      this.informacionPago.metodoPago === 'efectivo' && this.informacionPago.montoRecibido ? this.informacionPago.montoRecibido : undefined
    );

    const response = await this.checkoutService.crearPedidoEnBackend(datosPedido);
    this.pedidoIdCreado = response.idPedido;
    return response;
  }

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
          monto: this.subtotal, // Usar el subtotal con descuento aplicado
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
    if (this.stripeCardElementMontado) {
      this.pagoService.destroyCardElement();
      this.stripeCardElementMontado = false;
    }
    
    this.pasoActual = 1;
    this.errorPago = null;
    this.procesandoPago = false;
    
    this.quitarCupon();
    
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
      return this.informacionPago.montoRecibido - this.subtotal; // Usar subtotal con descuento
    }
    return 0;
  }

  obtenerNombreMetodoPago(): string {
    const metodo = this.metodosPago.find(m => m.id === this.informacionPago.metodoPago);
    return metodo ? metodo.nombre : 'Método no seleccionado';
  }

}
