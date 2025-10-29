import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OpcionPersonalizacion {
  idOpcion: number;
  nombre: string;
  descripcion?: string;
  precioAdicional: number;
  activa: boolean;
  idProducto: number;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalizacionService {
  private baseUrl = 'http://localhost:8089/api/v1/menu';

  constructor(private http: HttpClient) {}

  // Obtiene las opciones de personalización para un producto específico
  obtenerOpcionesPersonalizacion(idProducto: number): Observable<OpcionPersonalizacion[]> {
    const url = `${this.baseUrl}/productos/${idProducto}/opciones`;
    return this.http.get<OpcionPersonalizacion[]>(url);
  }

  // Calcula el precio total de las opciones seleccionadas
  calcularPrecioOpciones(opcionesSeleccionadas: OpcionPersonalizacion[]): number {
    return opcionesSeleccionadas.reduce((total, opcion) => total + opcion.precioAdicional, 0);
  }

  // Formatea las opciones seleccionadas para mostrar al usuario
  formatearOpcionesSeleccionadas(opcionesSeleccionadas: OpcionPersonalizacion[]): string {
    if (!opcionesSeleccionadas || opcionesSeleccionadas.length === 0) {
      return '';
    }

    return opcionesSeleccionadas
      .map(opcion => {
        const precio = opcion.precioAdicional > 0 ? ` (+S/. ${opcion.precioAdicional.toFixed(2)})` : '';
        return `${opcion.nombre}${precio}`;
      })
      .join(', ');
  }
}
