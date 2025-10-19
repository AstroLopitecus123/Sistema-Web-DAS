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

  buscarProductos(keyword: string): Observable<Producto[]> {
    const url = `${this.baseUrl}/productos/buscar`;
    console.log(`[MenuService] Buscando '${keyword}' en: ${url}`);
    
    const params = new HttpParams().set('keyword', keyword);
    
    return this.http.get<Producto[]>(url, { params });
  }
}