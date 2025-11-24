import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteResponse {
  idReporte: number;
  tipoReporte: string;
  nombreReporte: string;
  fechaGeneracion: string;
  fechaInicio?: string;
  fechaFin?: string;
  datos: any;
}

export interface MetodoPagoInhabilitado {
  idInhabilitacion: number;
  usuario: {
    idUsuario: number;
    nombre: string;
    email: string;
  };
  metodoPago: string;
  fechaInhabilitacion: string;
  razon: string;
  activo: boolean;
  reactivadoPorAdmin?: {
    idUsuario: number;
    nombre: string;
  };
  fechaReactivacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private baseUrl = 'http://localhost:8089/api/admin';

  constructor(private http: HttpClient) {}

  generarReporteVentas(idAdmin: number, fechaInicio?: string, fechaFin?: string): Observable<ReporteResponse> {
    let params = new HttpParams().set('idAdmin', idAdmin.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.post<ReporteResponse>(`${this.baseUrl}/reportes/ventas`, {}, { params });
  }

  generarReporteProductosVendidos(idAdmin: number, fechaInicio?: string, fechaFin?: string): Observable<ReporteResponse> {
    let params = new HttpParams().set('idAdmin', idAdmin.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.post<ReporteResponse>(`${this.baseUrl}/reportes/productos-vendidos`, {}, { params });
  }

  generarReporteGanancias(idAdmin: number, fechaInicio?: string, fechaFin?: string): Observable<ReporteResponse> {
    let params = new HttpParams().set('idAdmin', idAdmin.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.post<ReporteResponse>(`${this.baseUrl}/reportes/ganancias`, {}, { params });
  }

  obtenerInhabilitacionesActivas(): Observable<MetodoPagoInhabilitado[]> {
    return this.http.get<MetodoPagoInhabilitado[]>(`${this.baseUrl}/metodos-pago-inhabilitados`);
  }

  reactivarMetodoPago(idInhabilitacion: number, idAdmin: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/metodos-pago-inhabilitados/${idInhabilitacion}/reactivar`, {}, {
      params: new HttpParams().set('idAdmin', idAdmin.toString())
    });
  }

  obtenerPorcentajeCosto(): Observable<{ porcentaje: number; porcentajePorcentaje: number }> {
    return this.http.get<{ porcentaje: number; porcentajePorcentaje: number }>(`${this.baseUrl}/reportes/configuracion/porcentaje-costo`);
  }

  actualizarPorcentajeCosto(porcentaje: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/reportes/configuracion/porcentaje-costo`, { porcentaje });
  }
}

