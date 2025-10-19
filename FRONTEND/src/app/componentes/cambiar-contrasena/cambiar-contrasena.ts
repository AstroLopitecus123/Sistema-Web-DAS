import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { Usuario } from '../../modelos/usuario.model';
import { NotificacionService } from '../../servicios/notificacion.service';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-contrasena.html',
  styleUrls: ['./cambiar-contrasena.css']
})
export class CambiarContrasena implements OnInit {
  usuario: Usuario | null = null;
  passwordData = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  mostrarContrasenaActual: boolean = false;
  mostrarNuevaContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit() {
    // Obtener datos del usuario actual
    this.usuario = this.authService.getUsuarioActual();
    
    // Si no hay usuario logueado, redirigir al login
    if (!this.usuario) {
      this.router.navigate(['/login']);
    }
  }

  toggleMostrarContrasenaActual() {
    this.mostrarContrasenaActual = !this.mostrarContrasenaActual;
  }

  toggleMostrarNuevaContrasena() {
    this.mostrarNuevaContrasena = !this.mostrarNuevaContrasena;
  }

  toggleMostrarConfirmarContrasena() {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      return;
    }

    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError(
        'Error de usuario', 
        'No se pudo identificar al usuario'
      );
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Llamar al servicio real de cambio de contraseña
    this.authService.cambiarContrasena(
      this.usuario.idUsuario,
      this.passwordData.contrasenaActual,
      this.passwordData.nuevaContrasena
    ).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta del backend:', response);
        
        if (response && response.success) {
          this.notificacionService.mostrarExito(
            '¡Contraseña actualizada!', 
            response.mensaje || 'Contraseña actualizada correctamente'
          );
          
          // Limpiar formulario
          this.passwordData = {
            contrasenaActual: '',
            nuevaContrasena: '',
            confirmarContrasena: ''
          };
          
          // Redirigir al perfil después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/mi-perfil']);
          }, 2000);
        } else {
          this.notificacionService.mostrarError(
            'Error al cambiar contraseña', 
            response?.mensaje || 'Error al cambiar la contraseña'
          );
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cambiar contraseña:', err);
        
        if (err.error && err.error.mensaje) {
          this.notificacionService.mostrarError('Error al cambiar contraseña', err.error.mensaje);
        } else if (err.status === 401) {
          this.notificacionService.mostrarError(
            'Contraseña incorrecta', 
            'La contraseña actual es incorrecta'
          );
        } else if (err.status === 400) {
          this.notificacionService.mostrarError(
            'Datos inválidos', 
            'Verifica la información ingresada'
          );
        } else if (err.status === 404) {
          this.notificacionService.mostrarError('Usuario no encontrado', 'Usuario no encontrado');
        } else {
          this.notificacionService.mostrarError(
            'Error al cambiar contraseña', 
            'Por favor, intenta nuevamente'
          );
        }
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.passwordData.contrasenaActual.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'La contraseña actual es requerida');
      return false;
    }
    
    if (!this.passwordData.nuevaContrasena.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'La nueva contraseña es requerida');
      return false;
    }
    
    if (this.passwordData.nuevaContrasena.length < 6) {
      this.notificacionService.mostrarError(
        'Contraseña inválida', 
        'La nueva contraseña debe tener al menos 6 caracteres'
      );
      return false;
    }
    
    if (this.passwordData.nuevaContrasena !== this.passwordData.confirmarContrasena) {
      this.notificacionService.mostrarError('Contraseñas no coinciden', 'Las contraseñas no coinciden');
      return false;
    }
    
    if (this.passwordData.contrasenaActual === this.passwordData.nuevaContrasena) {
      this.notificacionService.mostrarError(
        'Contraseña inválida', 
        'La nueva contraseña debe ser diferente a la actual'
      );
      return false;
    }

    return true;
  }

  cancelar() {
    this.router.navigate(['/mi-perfil']);
  }
}

