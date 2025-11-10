import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../modelos/producto.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private baseUrl = 'http://localhost:8089/api/v1/menu';

  constructor(private http: HttpClient) {}

  obtenerMenuDisponible(): Observable<Producto[]> {
    const url = `${this.baseUrl}/productos`;
    console.log(`[MenuService] Solicitando menú a: ${url}`);
    
    return this.http.get<Producto[]>(url);
  }

  obtenerProductosAdmin(): Observable<Producto[]> {
    const url = `${this.baseUrl}/admin/productos`;
    console.log(`[MenuService] Solicitando productos admin a: ${url}`);
    return this.http.get<Producto[]>(url);
  }

  buscarProductos(keyword: string): Observable<Producto[]> {
    const url = `${this.baseUrl}/productos/buscar`;
    console.log(`[MenuService] Buscando '${keyword}' en: ${url}`);
    
    const params = new HttpParams().set('keyword', keyword);
    
    return this.http.get<Producto[]>(url, { params });
  }

  obtenerProductoPorId(idProducto: number): Observable<Producto> {
    const url = `${this.baseUrl}/productos/${idProducto}`;
    return this.http.get<Producto>(url);
  }

  guardarProducto(request: {
    idProducto?: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    idCategoria: number;
    imagenUrl?: string;
    estado?: string;
    stock?: number;
  }): Observable<Producto> {
    const url = `${this.baseUrl}/productos`;
    return this.http.post<Producto>(url, request);
  }

  eliminarProducto(idProducto: number): Observable<{ success: boolean; accion: string; mensaje: string }> {
    const url = `${this.baseUrl}/productos/${idProducto}`;
    return this.http.delete<{ success: boolean; accion: string; mensaje: string }>(url);
  }
}