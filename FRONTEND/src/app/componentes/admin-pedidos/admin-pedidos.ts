import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Pedido } from '../../modelos/pedido.model';
import { ConfiguracionService } from '../../servicios/configuracion.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.html',
  styleUrls: ['./admin-pedidos.css']
})
export class AdminPedidos implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  filtroEstado = 'todos';
  terminoBusqueda = '';

  constructor(private router: Router, private configuracionService: ConfiguracionService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    // Datos de ejemplo - en producción vendría del servicio
    this.pedidos = [
      {
        idPedido: 1847,
        fechaPedido: '2024-01-15T14:30:00Z',
        estadoPedido: 'pendiente',
        totalPedido: 25.50,
        direccionEntrega: 'Av. Los Pinos 456, San Isidro',
        notasCliente: 'Llamar antes de entregar',
        metodoPago: 'tarjeta',
        estadoPago: 'pagado',
        productos: [],
        cliente: {
          idUsuario: 1,
          nombre: 'María',
          apellido: 'González',
          telefono: '987 654 321'
        }
      },
      {
        idPedido: 1848,
        fechaPedido: '2024-01-15T15:15:00Z',
        estadoPedido: 'en_preparacion',
        totalPedido: 18.00,
        direccionEntrega: 'Jr. Las Flores 123, Miraflores',
        metodoPago: 'billetera_virtual',
        estadoPago: 'pagado',
        productos: [],
        cliente: {
          idUsuario: 2,
          nombre: 'Juan',
          apellido: 'Pérez',
          telefono: '987 123 456'
        },
        repartidor: {
          idRepartidor: 1,
          nombre: 'Luis',
          apellido: 'Repartidor',
          telefono: '987 789 012'
        }
      }
    ];
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.pedidosFiltrados = this.pedidos.filter(pedido => {
      const cumpleEstado = this.filtroEstado === 'todos' || pedido.estadoPedido === this.filtroEstado;
      const cumpleBusqueda = !this.terminoBusqueda || 
        pedido.idPedido.toString().includes(this.terminoBusqueda) ||
        pedido.cliente?.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        pedido.cliente?.apellido.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      return cumpleEstado && cumpleBusqueda;
    });
  }

  cambiarFiltroEstado() {
    this.aplicarFiltros();
  }

  buscarPedidos() {
    this.aplicarFiltros();
  }

  cambiarEstadoPedido(pedido: Pedido, nuevoEstado: string) {
    if (confirm(`¿Cambiar estado del pedido #${pedido.idPedido} a ${nuevoEstado}?`)) {
      pedido.estadoPedido = nuevoEstado as any;
      console.log('Estado cambiado:', pedido.idPedido, nuevoEstado);
      // Aquí se enviaría la actualización al servicio
    }
  }

  asignarRepartidor(pedido: Pedido) {
    // Lógica para asignar repartidor
    console.log('Asignando repartidor al pedido:', pedido.idPedido);
  }

  verDetallePedido(pedido: Pedido) {
    this.router.navigate(['/admin/pedidos/detalle', pedido.idPedido]);
  }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  obtenerEstadosDisponibles(estadoActual: string) {
    const estados: { [key: string]: string[] } = {
      'pendiente': ['aceptado', 'cancelado'],
      'aceptado': ['en_preparacion', 'cancelado'],
      'en_preparacion': ['en_camino', 'cancelado'],
      'en_camino': ['entregado'],
      'entregado': [],
      'cancelado': []
    };
    return estados[estadoActual] || [];
  }

  formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString('es-PE');
  }

  obtenerColorEstado(estado: string) {
    const colores: { [key: string]: string } = {
      'pendiente': '#ffc107',
      'aceptado': '#17a2b8',
      'en_preparacion': '#fd7e14',
      'en_camino': '#6f42c1',
      'entregado': '#28a745',
      'cancelado': '#dc3545'
    };
    return colores[estado] || '#6c757d';
  }

  obtenerTextoEstado(estado: string) {
    const textos: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'aceptado': 'Aceptado',
      'en_preparacion': 'En Preparación',
      'en_camino': 'En Camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  }

  // Métodos para notificaciones de WhatsApp
  notificarPedidoEnCamino(pedido: Pedido) {
    if (!pedido.cliente?.telefono) {
      alert('El cliente no tiene teléfono registrado para enviar notificación WhatsApp.');
      return;
    }

    if (confirm(`¿Enviar notificación WhatsApp de que el pedido #${pedido.idPedido} está en camino?`)) {
      this.configuracionService.notificarPedidoEnCamino(pedido.idPedido).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('✅ Notificación WhatsApp enviada exitosamente');
            this.cargarPedidos(); // Recargar para ver el cambio de estado
          } else {
            alert('❌ No se pudo enviar la notificación WhatsApp');
          }
        },
        error: (error) => {
          console.error('Error al enviar notificación:', error);
          alert('❌ Error al enviar la notificación WhatsApp');
        }
      });
    }
  }

  notificarPedidoEntregado(pedido: Pedido) {
    if (!pedido.cliente?.telefono) {
      alert('El cliente no tiene teléfono registrado para enviar notificación WhatsApp.');
      return;
    }

    if (confirm(`¿Enviar notificación WhatsApp de que el pedido #${pedido.idPedido} fue entregado?`)) {
      this.configuracionService.notificarPedidoEntregado(pedido.idPedido).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('✅ Notificación WhatsApp enviada exitosamente');
            this.cargarPedidos(); // Recargar para ver el cambio de estado
          } else {
            alert('❌ No se pudo enviar la notificación WhatsApp');
          }
        },
        error: (error) => {
          console.error('Error al enviar notificación:', error);
          alert('❌ Error al enviar la notificación WhatsApp');
        }
      });
    }
  }

  notificarPedidoCancelado(pedido: Pedido) {
    if (!pedido.cliente?.telefono) {
      alert('El cliente no tiene teléfono registrado para enviar notificación WhatsApp.');
      return;
    }

    const motivo = prompt('Ingrese el motivo de la cancelación:');
    if (!motivo || motivo.trim() === '') {
      alert('Debe ingresar un motivo para la cancelación.');
      return;
    }

    if (confirm(`¿Enviar notificación WhatsApp de cancelación del pedido #${pedido.idPedido}?`)) {
      this.configuracionService.notificarPedidoCancelado(pedido.idPedido, motivo.trim()).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('✅ Notificación WhatsApp enviada exitosamente');
            this.cargarPedidos(); // Recargar para ver el cambio de estado
          } else {
            alert('❌ No se pudo enviar la notificación WhatsApp');
          }
        },
        error: (error) => {
          console.error('Error al enviar notificación:', error);
          alert('❌ Error al enviar la notificación WhatsApp');
        }
      });
    }
  }

  // Verificar si se puede enviar una notificación según el estado del pedido
  puedeNotificarEnCamino(pedido: Pedido): boolean {
    return pedido.estadoPedido === 'aceptado' || pedido.estadoPedido === 'en_preparacion';
  }

  puedeNotificarEntregado(pedido: Pedido): boolean {
    return pedido.estadoPedido === 'en_camino';
  }

  puedeNotificarCancelado(pedido: Pedido): boolean {
    return pedido.estadoPedido !== 'entregado' && pedido.estadoPedido !== 'cancelado';
  }
}
