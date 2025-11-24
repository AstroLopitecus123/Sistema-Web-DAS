import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioAdmin {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol: 'cliente' | 'administrador' | 'repartidor' | 'vendedor';
  fechaRegistro: string;
  activo: boolean;
}

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  clientes: number;
  administradores: number;
  repartidores: number;
  vendedores: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8089/api';
  private adminApiUrl = `${this.apiUrl}/admin/usuarios`;
  private userApiUrl = `${this.apiUrl}/v1/usuarios`;

  constructor(private http: HttpClient) { }

  actualizarPerfil(idUsuario: number, datosPerfil: any): Observable<any> {
    return this.http.put(`${this.userApiUrl}/perfil/${idUsuario}`, datosPerfil);
  }

  obtenerPerfil(idUsuario: number): Observable<any> {
    return this.http.get(`${this.userApiUrl}/${idUsuario}`);
  }

  obtenerPerfilPorUsername(username: string): Observable<any> {
    return this.http.get(`${this.userApiUrl}/username/${username}`);
  }

  eliminarCuenta(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.userApiUrl}/${idUsuario}`);
  }

  obtenerTodosLosUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.adminApiUrl);
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioAdmin> {
    return this.http.get<UsuarioAdmin>(`${this.adminApiUrl}/${id}`);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/${id}/seguro`);
  }

  cambiarEstadoUsuario(id: number, activo: boolean): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/${id}/estado?activo=${activo}`, null);
  }

  cambiarRolUsuario(idUsuario: number, nuevoRol: string): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/cambiar-rol/${idUsuario}`, { rol: nuevoRol });
  }

  obtenerEstadisticas(): Observable<EstadisticasUsuarios> {
    return this.http.get<EstadisticasUsuarios>(`${this.adminApiUrl}/estadisticas`);
  }

  obtenerEstadisticasDashboard(): Observable<any> {
    return this.http.get<any>(`${this.adminApiUrl}/dashboard/estadisticas`);
  }

  buscarUsuarios(termino: string): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.adminApiUrl}?buscar=${encodeURIComponent(termino)}`);
  }

  filtrarUsuariosPorRol(rol: string): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.adminApiUrl}?rol=${encodeURIComponent(rol)}`);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerNombreRol(rol: string): string {
    const nombresRol: { [key: string]: string } = {
      'cliente': 'Cliente',
      'administrador': 'Administrador',
      'repartidor': 'Repartidor',
      'vendedor': 'Vendedor'
    };
    return nombresRol[rol] || rol;
  }

  obtenerClaseRol(rol: string): string {
    const clasesRol: { [key: string]: string } = {
      'cliente': 'badge-cliente',
      'administrador': 'badge-admin',
      'repartidor': 'badge-repartidor',
      'vendedor': 'badge-vendedor'
    };
    return clasesRol[rol] || 'badge-default';
  }
}
