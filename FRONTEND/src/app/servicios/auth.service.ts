import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario, AuthResponse, LoginRequest, RegistroRequest } from '../modelos/usuario.model';
import { ConfiguracionService } from './configuracion.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private configuracionService: ConfiguracionService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.configuracionService.getApiUrl()}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const user: Usuario = {
              idUsuario: response.data.idUsuario,
              nombre: response.data.nombre,
              apellido: response.data.apellido,
              email: response.data.email,
              username: response.data.username,
              telefono: response.data.telefono,
              direccion: response.data.direccion,
              rol: response.data.rol as any,
              activo: true
            };
            
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('token', response.data.token);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.configuracionService.getApiUrl()}/auth/registro`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const user: Usuario = {
              idUsuario: response.data.idUsuario,
              nombre: response.data.nombre,
              apellido: response.data.apellido,
              email: response.data.email,
              username: response.data.username,
              telefono: response.data.telefono,
              direccion: response.data.direccion,
              rol: response.data.rol as any,
              activo: true
            };
            
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('token', response.data.token);
          }
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getUsuarioActual(): Usuario | null {
    return this.getCurrentUser();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'administrador';
  }

  isCliente(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'cliente';
  }

  isRepartidor(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'repartidor';
  }

  cambiarContrasena(idUsuario: number, contrasenaActual: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.configuracionService.getApiUrl()}/auth/cambiar-contrasena`, {
      idUsuario,
      contrasenaActual,
      nuevaContrasena
    });
  }

  actualizarPerfil(idUsuario: number, datosPerfil: any): Observable<any> {
    return this.http.put(`${this.configuracionService.getApiUrl()}/auth/actualizar-perfil/${idUsuario}`, datosPerfil);
  }

  actualizarUsuarioActual(usuarioActualizado: Usuario): void {
    this.currentUserSubject.next(usuarioActualizado);
    localStorage.setItem('currentUser', JSON.stringify(usuarioActualizado));
  }

  procesarLoginExitoso(response: any, recordarUsuario: boolean): void {
    
    if (response && response.success && response.data) {
      const user: Usuario = {
        idUsuario: response.data.idUsuario,
        nombre: response.data.nombre,
        apellido: response.data.apellido,
        email: response.data.email,
        username: response.data.username,
        telefono: response.data.telefono,
        direccion: response.data.direccion,
        rol: response.data.rol as any,
        activo: true
      };
      
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', response.data.token);
      
      if (recordarUsuario) {
        localStorage.setItem('rememberUser', 'true');
      }
    }
  }

  redirectByRole(): void {
    const user = this.getCurrentUser();
    if (user) {
      switch (user.rol) {
        case 'administrador':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'repartidor':
          this.router.navigate(['/repartidor/dashboard']);
          break;
        default:
          this.router.navigate(['/menu']);
          break;
      }
    }
  }

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post(`${this.configuracionService.getApiUrl()}/auth/recuperar-contrasena`, { email })
      .pipe(
        catchError(error => {
          console.error('Password recovery error:', error);
          return throwError(() => error);
        })
      );
  }

  restablecerContrasena(token: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.configuracionService.getApiUrl()}/auth/restablecer-contrasena`, {
      token,
      nuevaContrasena
    }).pipe(
      catchError(error => {
        console.error('Password reset error:', error);
        return throwError(() => error);
      })
    );
  }
}