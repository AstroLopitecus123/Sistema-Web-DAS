import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepartidorService {
  private apiUrl = 'http://localhost:8089/api/repartidor';

  constructor(private http: HttpClient) {}

  actualizarEstadoPedido(idPedido: number, nuevoEstado: string, datos?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${idPedido}/estado`, {
      nuevoEstado,
      ...datos
    });
  }

  marcarPedidoComoEntregado(idPedido: number, datosEntrega?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${idPedido}/entregado`, datosEntrega);
  }
}
