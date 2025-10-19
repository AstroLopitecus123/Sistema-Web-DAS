import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario no autenticado. Redirigiendo a login...');
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar si el usuario es administrador
    if (this.authService.isAdmin()) {
      return true;
    }

    // Si no es admin, redirigir al menú
    console.log('Usuario sin permisos de administrador. Redirigiendo a menú...');
    this.router.navigate(['/menu']);
    return false;
  }
}

