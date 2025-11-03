import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { CarritoService } from './servicios/carrito.service';
import { NavbarComponent } from './componentes/navbar/navbar';
import { AuthService } from './servicios/auth.service';
import { Notificaciones } from './componentes/notificaciones/notificaciones';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, Notificaciones], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FRONTEND_SISTEMA_WEB_DAS';
  
  constructor(
    public carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.verificarSesionAlVolverPagina();
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // Verifica la sesión cuando el usuario vuelve a la página
  private verificarSesionAlVolverPagina(): void {
    // Listener para cuando la página vuelve a ser visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Listener para cuando se navega con botones del navegador
    window.addEventListener('pageshow', this.handlePageShow);
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.verificarAutenticacion();
    }
  }

  private handlePageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      this.verificarAutenticacion();
    }
  }

  private verificarAutenticacion(): void {
    const rutasPublicas = ['/login', '/registro', '/recuperar-contrasena'];
    const rutaActual = this.router.url.split('?')[0]; 
    
    if (!rutasPublicas.includes(rutaActual)) {
      if (!this.authService.isAuthenticated()) {
        this.authService.logout(); 
        this.router.navigate(['/login']);
      }
    }
  }
}
