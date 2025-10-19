import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { Usuario } from '../../modelos/usuario.model';
import { NotificacionService } from '../../servicios/notificacion.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.html',
  styleUrls: ['./editar-perfil.css']
})
export class EditarPerfil implements OnInit {
  usuario: Usuario | null = null;
  perfilData = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: ''
  };
  
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  loadingData: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit() {
    // Cargar datos del usuario actual
    this.usuario = this.authService.getUsuarioActual();
    
    // Si no hay usuario logueado, redirigir al login
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos del usuario desde el backend
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.loadingData = false;
      return;
    }

    // Cargar datos completos del usuario desde el backend
    this.usuarioService.obtenerPerfil(this.usuario.idUsuario).subscribe({
      next: (response: any) => {
        this.loadingData = false;
        console.log('Datos del usuario para editar:', response);
        
        if (response && this.usuario) {
          this.perfilData = {
            nombre: response.nombre || this.usuario.nombre || '',
            apellido: response.apellido || this.usuario.apellido || '',
            email: response.email || this.usuario.email || '',
            telefono: response.telefono || '',
            direccion: response.direccion || ''
          };
        }
      },
      error: (err: any) => {
        this.loadingData = false;
        console.error('Error al cargar datos del usuario:', err);
        this.notificacionService.mostrarError(
          'Error al cargar perfil', 
          'Error al cargar los datos del perfil'
        );
        
        // Cargar datos desde localStorage como fallback
        if (this.usuario) {
          this.perfilData = {
            nombre: this.usuario.nombre || '',
            apellido: this.usuario.apellido || '',
            email: this.usuario.email || '',
            telefono: this.usuario.telefono || '',
            direccion: this.usuario.direccion || ''
          };
        }
      }
    });
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

    // Preparar datos a enviar (sin el correo)
    const datosActualizacion = {
      nombre: this.perfilData.nombre.trim(),
      apellido: this.perfilData.apellido.trim(),
      telefono: this.perfilData.telefono.trim(),
      direccion: this.perfilData.direccion.trim()
    };

    // Llamar al servicio real de actualización
    this.authService.actualizarPerfil(this.usuario.idUsuario, datosActualizacion).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta del backend:', response);
        
        if (response && response.success) {
          this.notificacionService.mostrarExito(
            '¡Perfil actualizado!', 
            response.mensaje || 'Perfil actualizado correctamente'
          );
          
          // Refrescar el usuario actual en el AuthService
          if (response.usuario) {
            const usuarioActualizado: Usuario = {
              idUsuario: response.usuario.idUsuario,
              nombre: response.usuario.nombre,
              apellido: response.usuario.apellido,
              email: response.usuario.email,
              telefono: response.usuario.telefono,
              direccion: response.usuario.direccion,
              rol: response.usuario.rol as any,
              activo: true
            };
            this.authService.actualizarUsuarioActual(usuarioActualizado);
            console.log('Usuario actualizado en AuthService');
          }
          
          // Redirigir al perfil después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/mi-perfil']);
          }, 2000);
        } else {
          this.notificacionService.mostrarError(
            'Error al actualizar perfil', 
            response?.mensaje || 'Error al actualizar el perfil'
          );
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al actualizar perfil:', err);
        
        if (err.error && err.error.mensaje) {
          this.notificacionService.mostrarError('Error al actualizar perfil', err.error.mensaje);
        } else if (err.status === 404) {
          this.notificacionService.mostrarError('Usuario no encontrado', 'Usuario no encontrado');
        } else if (err.status === 400) {
          this.notificacionService.mostrarError(
            'Datos inválidos', 
            'Verifica la información ingresada'
          );
        } else {
          this.notificacionService.mostrarError(
            'Error al actualizar perfil', 
            'Por favor, intenta nuevamente'
          );
        }
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.perfilData.nombre.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'El nombre es requerido');
      return false;
    }
    
    if (!this.perfilData.apellido.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'El apellido es requerido');
      return false;
    }
    
    if (!this.perfilData.email.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'El email es requerido');
      return false;
    }
    
    if (!this.validarEmail(this.perfilData.email)) {
      this.notificacionService.mostrarError('Email inválido', 'El email no tiene un formato válido');
      return false;
    }
    
    if (!this.perfilData.telefono.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'El teléfono es requerido');
      return false;
    }
    
    if (!this.perfilData.direccion.trim()) {
      this.notificacionService.mostrarError('Campo requerido', 'La dirección es requerida');
      return false;
    }

    return true;
  }

  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  cancelar() {
    this.router.navigate(['/mi-perfil']);
  }
}

