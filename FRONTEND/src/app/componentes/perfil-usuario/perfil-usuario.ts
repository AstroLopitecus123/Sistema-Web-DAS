import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private estadisticasService: EstadisticasService
  ) {}

  ngOnInit() {
    // Obtener username de la ruta
    const username = this.route.snapshot.paramMap.get('username');
    
    if (!username) {
      // Si no hay username en la ruta, redirigir al login
      this.router.navigate(['/login']);
      return;
    }

    // Verificar que el usuario esté autenticado
    const usuarioActual = this.authService.getUsuarioActual();
    
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos completos del usuario desde el backend usando username
    this.cargarDatosCompletos(username);
    
    // Cargar estadísticas después de tener los datos
    // Se cargará en cargarDatosCompletos después de obtener el idUsuario
  }

  cargarDatosCompletos(username: string) {
    // Obtener datos completos del usuario desde el backend usando username
    this.usuarioService.obtenerPerfilPorUsername(username).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        if (response) {
          this.datosUsuario = response;
          
          // Crear objeto usuario con todos los datos
          const usuarioActualizado: Usuario = {
            idUsuario: response.idUsuario,
            nombre: response.nombre,
            apellido: response.apellido,
            email: response.email,
            username: response.username,
            telefono: response.telefono || '',
            direccion: response.direccion || '',
            rol: response.rol as any,
            activo: response.activo
          };
          
          this.usuario = usuarioActualizado;
          
          // Cargar estadísticas ahora que tenemos el idUsuario
          this.cargarEstadisticas();
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
    if (!this.usuario || !this.usuario.idUsuario) {
      this.estadisticas = {
        pedidosRealizados: 0,
        totalGastado: 0,
        cuponesUsados: 0
      };
      return;
    }

    this.estadisticasService.obtenerEstadisticasUsuario(this.usuario.idUsuario).subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        // Mantener valores por defecto en caso de error
        this.estadisticas = {
          pedidosRealizados: 0,
          totalGastado: 0,
          cuponesUsados: 0
        };
      }
    });
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
