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
        
        if (response && this.usuario) {
          // Remover +51 del teléfono para mostrar solo los números al usuario
          let telefonoMostrar = response.telefono || '';
          if (telefonoMostrar.startsWith('+51')) {
            telefonoMostrar = telefonoMostrar.substring(3);
          }
          
          this.perfilData = {
            nombre: response.nombre || this.usuario.nombre || '',
            apellido: response.apellido || this.usuario.apellido || '',
            email: response.email || this.usuario.email || '',
            telefono: telefonoMostrar,
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
          // Remover +51 del teléfono para mostrar solo los números al usuario
          let telefonoMostrar = this.usuario.telefono || '';
          if (telefonoMostrar && telefonoMostrar.startsWith('+51')) {
            telefonoMostrar = telefonoMostrar.substring(3);
          }
          
          this.perfilData = {
            nombre: this.usuario.nombre || '',
            apellido: this.usuario.apellido || '',
            email: this.usuario.email || '',
            telefono: telefonoMostrar,
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
    // Normalizar teléfono: asegurar que tenga +51
    let telefonoNormalizado = this.perfilData.telefono.trim();
    if (telefonoNormalizado && telefonoNormalizado !== '') {
      telefonoNormalizado = this.normalizarTelefono(telefonoNormalizado);
    } else {
      telefonoNormalizado = '';
    }
    
    const datosActualizacion = {
      nombre: this.perfilData.nombre.trim(),
      apellido: this.perfilData.apellido.trim(),
      telefono: telefonoNormalizado,
      direccion: this.perfilData.direccion.trim()
    };

    // Llamar al servicio real de actualización
    this.authService.actualizarPerfil(this.usuario.idUsuario, datosActualizacion).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response && response.success) {
          this.notificacionService.mostrarExito(
            '¡Perfil actualizado!', 
            response.mensaje || 'Perfil actualizado correctamente'
          );
          
          // Refrescar el usuario actual en el AuthService
          if (response.usuario) {
            const usuarioActual = this.authService.getUsuarioActual();
            
            const usuarioActualizado: Usuario = {
              idUsuario: response.usuario.idUsuario,
              nombre: response.usuario.nombre,
              apellido: response.usuario.apellido,
              email: response.usuario.email,
              username: response.usuario.username || usuarioActual?.username,
              telefono: response.usuario.telefono,
              direccion: response.usuario.direccion,
              rol: response.usuario.rol as any,
              activo: true
            };
            this.authService.actualizarUsuarioActual(usuarioActualizado);
          }
          
          // Redirigir al perfil después de 2 segundos
          setTimeout(() => {
            const usuario = this.authService.getUsuarioActual();
            if (usuario?.username) {
              this.router.navigate(['/mi-perfil', usuario.username]);
            } else {
              this.router.navigate(['/menu']);
            }
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
    
    // Teléfono es opcional, pero si está presente debe tener formato válido
    if (this.perfilData.telefono.trim() && !this.validarTelefono(this.perfilData.telefono.trim())) {
      this.notificacionService.mostrarError('Teléfono inválido', 'El teléfono debe tener un formato válido');
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

  validarTelefono(telefono: string): boolean {
    if (!telefono || telefono.trim() === '') {
      return true; // Teléfono es opcional
    }
    // Debe ser solo números (sin +51, eso se agregará automáticamente)
    const soloNumeros = telefono.replace(/\D/g, '');
    return soloNumeros.length >= 9 && soloNumeros.length <= 12;
  }

  // Normaliza el teléfono
  normalizarTelefono(telefono: string): string {
    if (!telefono || telefono.trim() === '') {
      return '';
    }

    // Remover espacios
    let telefonoLimpio = telefono.replace(/\s+/g, '');

    if (telefonoLimpio.startsWith('+51')) {
      return telefonoLimpio;
    }

    if (telefonoLimpio.startsWith('+')) {
      const soloNumeros = telefonoLimpio.substring(1).replace(/\D/g, '');
      if (soloNumeros.length > 0) {
        return '+51' + soloNumeros;
      }
    }

    // Si son solo números (sin +), agregar +51
    const soloNumeros = telefonoLimpio.replace(/\D/g, '');
    if (soloNumeros.length > 0) {
      return '+51' + soloNumeros;
    }

    return '+51';
  }

  cancelar() {
    const usuario = this.authService.getUsuarioActual();
    if (usuario?.username) {
      this.router.navigate(['/mi-perfil', usuario.username]);
    } else {
      this.router.navigate(['/menu']);
    }
  }
}

