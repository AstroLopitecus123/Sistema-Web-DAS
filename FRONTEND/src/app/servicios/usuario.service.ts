import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para usuarios
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

/**
 * Servicio unificado para gestión de usuarios
 * Incluye: perfil de usuario, administración de usuarios, y utilidades
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8089/api';
  private adminApiUrl = `${this.apiUrl}/admin/usuarios`;
  private userApiUrl = `${this.apiUrl}/v1/usuarios`;

  constructor(private http: HttpClient) { }

  // ==================== GESTIÓN DE PERFIL DE USUARIO ====================

  /**
   * Actualiza el perfil del usuario actual
   */
  actualizarPerfil(idUsuario: number, datosPerfil: any): Observable<any> {
    return this.http.put(`${this.userApiUrl}/perfil/${idUsuario}`, datosPerfil);
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  obtenerPerfil(idUsuario: number): Observable<any> {
    return this.http.get(`${this.userApiUrl}/${idUsuario}`);
  }

  /**
   * Elimina la cuenta del usuario actual
   */
  eliminarCuenta(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.userApiUrl}/${idUsuario}`);
  }

  // ==================== ADMINISTRACIÓN DE USUARIOS ====================

  /**
   * Obtiene todos los usuarios del sistema (solo admin)
   */
  obtenerTodosLosUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.adminApiUrl);
  }

  /**
   * Obtiene un usuario por ID (solo admin)
   */
  obtenerUsuarioPorId(id: number): Observable<UsuarioAdmin> {
    return this.http.get<UsuarioAdmin>(`${this.adminApiUrl}/${id}`);
  }

  /**
   * Elimina un usuario (solo admin) - Usa el endpoint seguro
   */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/${id}/seguro`);
  }

  /**
   * Cambia el estado activo/inactivo de un usuario (solo admin)
   */
  cambiarEstadoUsuario(id: number, activo: boolean): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/${id}/estado?activo=${activo}`, null);
  }

  /**
   * Cambia el rol de un usuario (solo admin)
   */
  cambiarRolUsuario(idUsuario: number, nuevoRol: string): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/cambiar-rol/${idUsuario}`, { rol: nuevoRol });
  }

  // ==================== ESTADÍSTICAS Y REPORTES ====================

  /**
   * Obtiene estadísticas de usuarios (solo admin)
   */
  obtenerEstadisticas(): Observable<EstadisticasUsuarios> {
    return this.http.get<EstadisticasUsuarios>(`${this.adminApiUrl}/estadisticas`);
  }

  // ==================== BÚSQUEDA Y FILTROS ====================

  /**
   * Busca usuarios por nombre o email (solo admin)
   */
  buscarUsuarios(termino: string): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.adminApiUrl}?buscar=${encodeURIComponent(termino)}`);
  }

  /**
   * Filtra usuarios por rol (solo admin)
   */
  filtrarUsuariosPorRol(rol: string): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.adminApiUrl}?rol=${encodeURIComponent(rol)}`);
  }

  // ==================== UTILIDADES ====================

  /**
   * Formatea la fecha para mostrar
   */
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

  /**
   * Obtiene el nombre del rol
   */
  obtenerNombreRol(rol: string): string {
    const nombresRol: { [key: string]: string } = {
      'cliente': 'Cliente',
      'administrador': 'Administrador',
      'repartidor': 'Repartidor',
      'vendedor': 'Vendedor'
    };
    return nombresRol[rol] || rol;
  }

  /**
   * Obtiene la clase CSS para el badge del rol
   */
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
