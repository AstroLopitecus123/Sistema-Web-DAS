import { Injectable } from '@angular/core';
import { Pedido } from '../modelos/pedido.model';

export interface FiltrosPedidos {
  periodo: 'todos' | 'ultima_semana' | 'ultimo_mes' | 'ultimos_3_meses';
  estado: 'todos' | 'pendiente' | 'aceptado' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado';
}

@Injectable({
  providedIn: 'root'
})
export class FiltrosService {

  // Aplica filtros a la lista de pedidos
  aplicarFiltrosPedidos(pedidos: Pedido[], filtros: FiltrosPedidos): Pedido[] {
    let pedidosFiltrados = [...pedidos];

    // Aplicar filtro de período
    if (filtros.periodo !== 'todos') {
      pedidosFiltrados = this.filtrarPorPeriodo(pedidosFiltrados, filtros.periodo);
    }

    // Aplicar filtro de estado
    if (filtros.estado !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.estadoPedido === filtros.estado
      );
    }

    return pedidosFiltrados;
  }

  // Filtra pedidos por período de tiempo
  private filtrarPorPeriodo(pedidos: Pedido[], periodo: string): Pedido[] {
    const ahora = new Date();
    let fechaLimite: Date;

    switch (periodo) {
      case 'ultima_semana':
        fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'ultimo_mes':
        fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'ultimos_3_meses':
        fechaLimite = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return pedidos;
    }

    return pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.fechaPedido);
      return fechaPedido >= fechaLimite;
    });
  }

  // Obtiene las opciones de filtro disponibles
  obtenerOpcionesFiltro(): {
    periodos: { valor: string; etiqueta: string }[];
    estados: { valor: string; etiqueta: string }[];
  } {
    return {
      periodos: [
        { valor: 'todos', etiqueta: 'Todos los períodos' },
        { valor: 'ultima_semana', etiqueta: 'Última semana' },
        { valor: 'ultimo_mes', etiqueta: 'Último mes' },
        { valor: 'ultimos_3_meses', etiqueta: 'Últimos 3 meses' }
      ],
      estados: [
        { valor: 'todos', etiqueta: 'Todos los estados' },
        { valor: 'pendiente', etiqueta: 'Pendiente' },
        { valor: 'aceptado', etiqueta: 'Aceptado' },
        { valor: 'en_preparacion', etiqueta: 'En preparación' },
        { valor: 'en_camino', etiqueta: 'En camino' },
        { valor: 'entregado', etiqueta: 'Entregado' },
        { valor: 'cancelado', etiqueta: 'Cancelado' }
      ]
    };
  }

  // Obtiene el texto descriptivo de un filtro
  obtenerTextoFiltro(tipo: 'periodo' | 'estado', valor: string): string {
    const opciones = this.obtenerOpcionesFiltro();
    const lista = tipo === 'periodo' ? opciones.periodos : opciones.estados;
    const opcion = lista.find(o => o.valor === valor);
    return opcion ? opcion.etiqueta : valor;
  }
}
