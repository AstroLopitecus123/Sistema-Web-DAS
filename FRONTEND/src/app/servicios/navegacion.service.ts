import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Navega a una ruta específica con lógica de roles
  navegarA(ruta: string): void {
    // Si es "Mi Perfil", aplicar lógica de roles
    if (ruta === '/mi-perfil') {
      this.navegarAPerfil();
    } else {
      this.router.navigate([ruta]);
    }
  }

  // Navega al perfil según el rol del usuario
  private navegarAPerfil(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      // Si no está autenticado, ir al login
      this.router.navigate(['/login']);
    } else if (this.authService.isAdmin()) {
      // Si es admin autenticado, ir al dashboard de admin
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isRepartidor()) {
      // Si es repartidor autenticado, ir al dashboard de repartidor
      this.router.navigate(['/repartidor/dashboard']);
    } else {
      // Para clientes autenticados, ir al perfil normal usando username
      const usuario = this.authService.getUsuarioActual();
      if (usuario?.username) {
        this.router.navigate(['/mi-perfil', usuario.username]);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  // Obtiene la ruta de perfil según el rol del usuario
  obtenerRutaPerfil(): string {
    if (!this.authService.isAuthenticated()) {
      return '/login';
    } else if (this.authService.isAdmin()) {
      return '/admin/dashboard';
    } else if (this.authService.isRepartidor()) {
      return '/repartidor/dashboard';
    } else {
      const usuario = this.authService.getUsuarioActual();
      if (usuario?.username) {
        return `/mi-perfil/${usuario.username}`;
      }
      return '/login';
    }
  }

  // Verifica si el usuario puede acceder a una ruta
  puedeAccederA(ruta: string): boolean {
    // Rutas públicas
    const rutasPublicas = ['/login', '/registro', '/recuperar-contrasena', '/restablecer-contrasena'];
    if (rutasPublicas.includes(ruta)) {
      return true;
    }

    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    // Verificar permisos por rol
    if (ruta.startsWith('/admin/')) {
      return this.authService.isAdmin();
    }

    if (ruta.startsWith('/repartidor/')) {
      return this.authService.isRepartidor();
    }

    // Rutas de cliente
    return this.authService.isCliente();
  }

  // Redirige al usuario a la página apropiada según su rol
  redirigirPorRol(): void {
    const rutaPerfil = this.obtenerRutaPerfil();
    this.router.navigate([rutaPerfil]);
  }
}
