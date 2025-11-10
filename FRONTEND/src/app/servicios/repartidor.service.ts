import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepartidorService {
  private apiUrl = 'http://localhost:8089/api/repartidor';

  constructor(private http: HttpClient) {}

  // Obtiene pedidos disponibles para aceptar
  obtenerPedidosDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos/disponibles`);
  }

  // Obtiene pedidos asignados a un repartidor
  obtenerMisPedidos(idRepartidor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos/mios/${idRepartidor}`);
  }

  // Acepta un pedido (asigna repartidor)
  aceptarPedido(idPedido: number, idRepartidor: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/${idPedido}/aceptar`, {
      idRepartidor: idRepartidor
    });
  }

  actualizarEstadoPedido(idPedido: number, nuevoEstado: string, datos?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${idPedido}/estado`, {
      nuevoEstado,
      ...datos
    });
  }

  marcarPedidoComoEntregado(idPedido: number, datosEntrega?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${idPedido}/entregado`, datosEntrega);
  }

  // Obtiene historial de entregas completadas de un repartidor
  obtenerHistorialEntregas(idRepartidor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial/${idRepartidor}`);
  }

  // Obtiene estadísticas del repartidor (entregas hoy, esta semana, este mes, ganado)
  obtenerEstadisticas(idRepartidor: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas/${idRepartidor}`);
  }

  // Obtiene historial reciente del cliente
  obtenerHistorialCliente(idCliente: number, limite: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos/cliente/${idCliente}/historial`, {
      params: { limite }
    });
  }

  cancelarPedido(idPedido: number, idRepartidor: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${idPedido}/cancelar`, {
      idRepartidor
    });
  }

  reportarProblema(idPedido: number, idRepartidor: number, descripcion: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/${idPedido}/reportar-problema`, {
      idRepartidor,
      descripcion
    });
  }

  obtenerReportesProblemas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos/reportes`);
  }
}
