import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { NavegacionService } from '../../servicios/navegacion.service';
import { Usuario } from '../../modelos/usuario.model';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  usuario: Usuario | null = null;
  mostrarMenu = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    public carritoService: CarritoService,
    private navegacionService: NavegacionService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  logout() {
    this.authService.logout();
  }

  navegarA(ruta: string) {
    this.navegacionService.navegarA(ruta);
    this.mostrarMenu = false;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isRepartidor(): boolean {
    return this.authService.isRepartidor();
  }

  isCliente(): boolean {
    return this.authService.isCliente();
  }
}
