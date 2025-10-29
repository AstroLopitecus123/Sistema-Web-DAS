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

  // Crea la estructura de datos del pedido para enviar al backend
  crearDatosPedido(
    items: ItemCarrito[], 
    subtotal: number, 
    direccionEntrega: string, 
    notasCliente: string, 
    metodoPago: 'tarjeta' | 'billetera_virtual' | 'efectivo'
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
      productos: this.mapearProductos(items)
    };
  }

  // Mapea los items del carrito a la estructura esperada por el backend
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

  // Crea el pedido en el backend
  crearPedidoEnBackend(datosPedido: DatosPedido): Promise<any> {

    return new Promise((resolve, reject) => {
      this.pagoService.crearPedido(datosPedido).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          console.error('Error al crear pedido:', error);
          reject(new Error('No se pudo crear el pedido en el servidor'));
        }
      });
    });
  }
}
