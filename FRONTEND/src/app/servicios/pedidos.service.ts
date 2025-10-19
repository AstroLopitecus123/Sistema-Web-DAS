import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../modelos/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private baseUrl = 'http://localhost:8089/api/v1/pedidos';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el historial de pedidos del usuario
   */
  obtenerHistorialPedidos(idUsuario: number): Observable<Pedido[]> {
    const url = `${this.baseUrl}/usuario/${idUsuario}`;
    console.log(`[PedidosService] Obteniendo historial de pedidos para usuario ${idUsuario}: ${url}`);
    return this.http.get<Pedido[]>(url);
  }

  /**
   * Obtiene los detalles de un pedido específico
   */
  obtenerDetallePedido(idPedido: number): Observable<Pedido> {
    const url = `${this.baseUrl}/${idPedido}`;
    console.log(`[PedidosService] Obteniendo detalle del pedido ${idPedido}: ${url}`);
    return this.http.get<Pedido>(url);
  }

}
