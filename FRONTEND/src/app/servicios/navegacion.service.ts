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

  navegarA(ruta: string): void {
    if (ruta === '/mi-perfil') {
      this.navegarAPerfil();
    } else {
      this.router.navigate([ruta]);
    }
  }

  private navegarAPerfil(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isRepartidor()) {
      this.router.navigate(['/repartidor/dashboard']);
    } else {
      const usuario = this.authService.getUsuarioActual();
      if (usuario?.username) {
        this.router.navigate(['/mi-perfil', usuario.username]);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

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

  puedeAccederA(ruta: string): boolean {
    const rutasPublicas = ['/login', '/registro', '/recuperar-contrasena', '/restablecer-contrasena'];
    if (rutasPublicas.includes(ruta)) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      return false;
    }

    if (ruta.startsWith('/admin/')) {
      return this.authService.isAdmin();
    }

    if (ruta.startsWith('/repartidor/')) {
      return this.authService.isRepartidor();
    }

    return this.authService.isCliente();
  }

  redirigirPorRol(): void {
    const rutaPerfil = this.obtenerRutaPerfil();
    this.router.navigate([rutaPerfil]);
  }
}
