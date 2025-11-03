import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { NavegacionService } from '../../servicios/navegacion.service';
import { Usuario } from '../../modelos/usuario.model';
import { CarritoService } from '../../servicios/carrito.service';
import { UbicacionService, UbicacionSeleccionada } from '../../servicios/ubicacion.service';
import { ModalUbicacionService } from '../../servicios/modal-ubicacion.service';
import { SelectorUbicacionComponent } from '../selector-ubicacion/selector-ubicacion';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIf, RouterModule, SelectorUbicacionComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  mostrarMenu = false;
  mostrarModalUbicacion = false;
  ubicacionSeleccionada: UbicacionSeleccionada | null = null;
  private ubicacionSub?: Subscription;
  private modalSub?: Subscription;

  constructor(
    private authService: AuthService,
    public router: Router,
    public carritoService: CarritoService,
    private navegacionService: NavegacionService,
    private ubicacionService: UbicacionService,
    private modalUbicacionService: ModalUbicacionService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(usuario => {
      this.usuario = usuario;
    });

    this.ubicacionSub = this.ubicacionService.obtenerUbicacion().subscribe((ubicacion) => {
      this.ubicacionSeleccionada = ubicacion;
    });

    const ubicacionActual = this.ubicacionService.obtenerUbicacionActual();
    if (ubicacionActual) {
      this.ubicacionSeleccionada = ubicacionActual;
    }

    this.modalSub = this.modalUbicacionService.estado$().subscribe(estado => {
      this.mostrarModalUbicacion = estado;
    });
  }

  ngOnDestroy(): void {
    this.ubicacionSub?.unsubscribe();
    this.modalSub?.unsubscribe();
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

  abrirModalUbicacion(): void {
    this.modalUbicacionService.abrir();
  }

  cerrarModalUbicacion(): void {
    this.modalUbicacionService.cerrar();
  }
}
