import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CuponAdmin {
  idCupon: number;
  codigo: string;
  tipoDescuento: 'porcentaje' | 'monto_fijo';
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadDisponible?: number;
  usosMaximosPorUsuario?: number;
  montoMinimoCompra: number;
  activo: boolean;
  fechaCreacion: string;
  creadoPorAdmin: string;
}

export interface CuponRequest {
  codigo: string;
  tipoDescuento: string;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadDisponible?: number;
  usosMaximosPorUsuario?: number;
  montoMinimoCompra?: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CuponAdminService {
  private baseUrl = 'http://localhost:8089/api/admin/cupones';

  constructor(private http: HttpClient) {}

  obtenerTodosLosCupones(): Observable<CuponAdmin[]> {
    return this.http.get<CuponAdmin[]>(this.baseUrl);
  }

  obtenerCuponPorId(id: number): Observable<CuponAdmin> {
    return this.http.get<CuponAdmin>(`${this.baseUrl}/${id}`);
  }

  crearCupon(cupon: CuponRequest, idAdmin: number): Observable<any> {
    return this.http.post(`${this.baseUrl}?idAdmin=${idAdmin}`, cupon);
  }

  actualizarCupon(id: number, cupon: CuponRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, cupon);
  }

  cambiarEstadoCupon(id: number, activo: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/estado`, { activo });
  }

  eliminarCupon(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

