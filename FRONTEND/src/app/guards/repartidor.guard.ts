import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RepartidorGuard implements CanActivate {
  
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

    // Verificar si el usuario es repartidor
    if (this.authService.isRepartidor()) {
      return true;
    }

    // Si no es repartidor, redirigir al menú
    console.log('Usuario sin permisos de repartidor. Redirigiendo a menú...');
    this.router.navigate(['/menu']);
    return false;
  }
}

