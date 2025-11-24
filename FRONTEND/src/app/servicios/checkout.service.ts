import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PagoService } from './pago.service';
import { ItemCarrito, OpcionPersonalizacion } from '../modelos/producto.model';

export interface DatosPedido {
  idCliente: number;
  totalPedido: number;
  direccionEntrega: string;
  notasCliente: string;
  metodoPago: 'tarjeta' | 'billetera_virtual' | 'efectivo';
  codigoCupon?: string;
  montoPagadoCliente?: number; // Monto con el que el cliente va a pagar (solo para efectivo)
  productos: ProductoPedido[];
}

export interface ProductoPedido {
  idProducto: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notasPersonalizacion: string;
  opcionesSeleccionadas?: string;
  precioOpciones?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private authService: AuthService,
    private pagoService: PagoService
  ) {}

  crearDatosPedido(
    items: ItemCarrito[], 
    subtotal: number, 
    direccionEntrega: string, 
    notasCliente: string, 
    metodoPago: 'tarjeta' | 'billetera_virtual' | 'efectivo',
    codigoCupon?: string,
    montoPagadoCliente?: number
  ): DatosPedido {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) {
      throw new Error('Debes iniciar sesión para realizar un pedido');
    }

    return {
      idCliente: usuario.idUsuario,
      totalPedido: subtotal,
      direccionEntrega,
      notasCliente: notasCliente || '',
      metodoPago,
      codigoCupon: codigoCupon || undefined,
      montoPagadoCliente: metodoPago === 'efectivo' && montoPagadoCliente ? montoPagadoCliente : undefined,
      productos: this.mapearProductos(items)
    };
  }

  private mapearProductos(items: ItemCarrito[]): ProductoPedido[] {
    return items.map(item => {
      const opcionesSeleccionadas = item.opcionesSeleccionadas 
        ? JSON.stringify(item.opcionesSeleccionadas.map(opcion => opcion.nombre))
        : undefined;
      
      const precioOpciones = item.precioOpciones || 0;
      const subtotalConOpciones = (item.precio + precioOpciones) * item.cantidad;

      return {
        idProducto: item.idProducto,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: subtotalConOpciones,
        notasPersonalizacion: item.notasPersonalizacion || '',
        opcionesSeleccionadas,
        precioOpciones
      };
    });
  }

  crearPedidoEnBackend(datosPedido: DatosPedido): Promise<any> {

    return new Promise((resolve, reject) => {
      this.pagoService.crearPedido(datosPedido).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          console.error('Error al crear pedido:', error);
          const mensajeError = error?.error?.mensaje || error?.error?.message || error?.message || 'No se pudo crear el pedido en el servidor';
          reject(new Error(mensajeError));
        }
      });
    });
  }
}
