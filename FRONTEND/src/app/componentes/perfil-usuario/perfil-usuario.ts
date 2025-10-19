import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { EstadisticasService } from '../../servicios/estadisticas.service';
import { Usuario } from '../../modelos/usuario.model';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.css']
})
export class PerfilUsuario implements OnInit {
  usuario: Usuario | null = null;
  mostrarModalSalir: boolean = false;
  mostrarModalEliminar: boolean = false;
  loading: boolean = true;
  errorMessage: string | null = null;
  mostrarNotificacion: boolean = false;
  mensajeNotificacion: string = '';
  
  // Datos completos del usuario (con telefono, direccion, etc.)
  datosUsuario: any = null;
  
  // Estadísticas del usuario
  estadisticas = {
    pedidosRealizados: 0,
    totalGastado: 0,
    cuponesUsados: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private usuarioService: UsuarioService,
    private estadisticasService: EstadisticasService
  ) {}

  ngOnInit() {
    // Obtener datos básicos del usuario actual desde localStorage
    this.usuario = this.authService.getUsuarioActual();
    
    // Si no hay usuario logueado, redirigir al login
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos completos del usuario desde el backend
    this.cargarDatosCompletos();
    
    // Cargar estadísticas del usuario
    this.cargarEstadisticas();
  }

  cargarDatosCompletos() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.loading = false;
      return;
    }

    // Obtener datos completos del usuario desde el backend
    this.usuarioService.obtenerPerfil(this.usuario.idUsuario).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('Datos completos del usuario:', response);
        console.log('Fecha de registro recibida:', response.fechaRegistro);
        console.log('Tipo de fecha:', typeof response.fechaRegistro);
        
        if (response) {
          this.datosUsuario = response;
          
          // Actualizar el usuario en localStorage con los datos completos
          if (this.usuario) {
            const usuarioActualizado: Usuario = {
              ...this.usuario,
              telefono: response.telefono || '',
              direccion: response.direccion || ''
            };
            
            this.usuario = usuarioActualizado;
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
          }
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al cargar datos del usuario:', err);
        this.errorMessage = 'Error al cargar los datos del perfil';
      }
    });
  }

  cargarEstadisticas() {
    this.estadisticas = this.estadisticasService.calcularEstadisticasUsuario(this.usuario);
  }

  mostrarConfirmacionSalir(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.mostrarModalSalir = true;
  }

  cerrarModalSalir() {
    this.mostrarModalSalir = false;
  }

  confirmarSalir() {
    this.mostrarModalSalir = false;
    this.salir();
  }

  salir() {
    this.authService.logout();
  }

  editarPerfil() {
    this.router.navigate(['/editar-perfil']);
  }

  cambiarContrasena() {
    this.router.navigate(['/cambiar-contrasena']);
  }

  mostrarConfirmacionEliminar(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
  }

  mostrarNotificacionExito() {
    this.mensajeNotificacion = 'Tu cuenta ha sido eliminada exitosamente.';
    this.mostrarNotificacion = true;
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 3000);
  }

  confirmarEliminar() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.errorMessage = 'No se pudo identificar el usuario';
      this.cerrarModalEliminar();
      return;
    }

    // Llamar al servicio para eliminar la cuenta
    this.usuarioService.eliminarCuenta(this.usuario.idUsuario).subscribe({
      next: () => {
        console.log('Cuenta eliminada exitosamente');
        this.cerrarModalEliminar();
        
        // Mostrar mensaje de éxito con notificación elegante
        this.mostrarNotificacionExito();
        
        // Cerrar sesión y redirigir al login después de un breve delay
        setTimeout(() => {
          this.authService.logout();
        }, 2000);
      },
      error: (err: any) => {
        console.error('Error al eliminar cuenta:', err);
        this.cerrarModalEliminar();
        
        if (err.status === 404) {
          this.errorMessage = 'No se encontró la cuenta del usuario';
        } else if (err.status === 403) {
          this.errorMessage = 'No tienes permisos para eliminar esta cuenta';
        } else {
          this.errorMessage = 'Error al eliminar la cuenta. Por favor, intenta nuevamente.';
        }
      }
    });
  }
}
