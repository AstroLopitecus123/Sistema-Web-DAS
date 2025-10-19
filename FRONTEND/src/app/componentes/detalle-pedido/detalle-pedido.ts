import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DetallePedidoData {
  idPedido: number;
  fechaPedido: string;
  estadoPedido: 'pendiente' | 'aceptado' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado';
  totalPedido: number;
  direccionEntrega: string;
  notasCliente?: string;
  fechaEntrega?: string;
  metodoPago: 'tarjeta' | 'billetera_virtual' | 'efectivo';
  estadoPago: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado';
  repartidor?: {
    idRepartidor: number;
    nombre: string;
    apellido: string;
    telefono: string;
  };
  productos: ProductoDetalle[];
}

export interface ProductoDetalle {
  idProducto: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notasPersonalizacion?: string;
  imagenUrl?: string;
  categoria: string;
}

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido.html',
  styleUrls: ['./detalle-pedido.css']
})
export class DetallePedido implements OnInit {
  @Input() pedido: DetallePedidoData | null = null;
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'entregado':
        return 'estado-entregado';
      case 'en_camino':
        return 'estado-en-camino';
      case 'en_preparacion':
        return 'estado-en-preparacion';
      case 'aceptado':
        return 'estado-aceptado';
      case 'pendiente':
        return 'estado-pendiente';
      case 'cancelado':
        return 'estado-cancelado';
      default:
        return 'estado-pendiente';
    }
  }

  obtenerTextoEstado(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'aceptado':
        return 'Aceptado';
      case 'en_preparacion':
        return 'En Preparación';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  obtenerTextoMetodoPago(metodo: string): string {
    switch (metodo) {
      case 'tarjeta':
        return 'Tarjeta';
      case 'billetera_virtual':
        return 'Billetera Virtual';
      case 'efectivo':
        return 'Efectivo';
      default:
        return metodo;
    }
  }

  obtenerClaseEstadoPago(estado: string): string {
    switch (estado) {
      case 'pagado':
        return 'estado-pago-pagado';
      case 'pendiente':
        return 'estado-pago-pendiente';
      case 'fallido':
        return 'estado-pago-fallido';
      case 'reembolsado':
        return 'estado-pago-reembolsado';
      default:
        return 'estado-pago-pendiente';
    }
  }

  obtenerTextoEstadoPago(estado: string): string {
    switch (estado) {
      case 'pagado':
        return 'Pagado';
      case 'pendiente':
        return 'Pendiente';
      case 'fallido':
        return 'Fallido';
      case 'reembolsado':
        return 'Reembolsado';
      default:
        return estado;
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
