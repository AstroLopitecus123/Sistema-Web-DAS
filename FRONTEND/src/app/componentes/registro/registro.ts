import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; 
import { AuthService } from '../../servicios/auth.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { CampoUbicacion } from '../campo-ubicacion/campo-ubicacion';

interface RegistroData {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  confirmarContrasena: string;
  telefono: string;
  direccion: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CampoUbicacion], 
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  registroData: RegistroData = {
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '+51',
    direccion: ''
  };

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  mostrarContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;
  aceptoTerminos: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) { }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarConfirmarContrasena(): void {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  onSubmit(): void {
    this.errorMessage = null; 
    this.successMessage = null;

    // Validar que se hayan aceptado los términos
    if (!this.aceptoTerminos) {
      this.notificacionService.mostrarError(
        'Términos requeridos', 
        'Debes aceptar los Términos y Condiciones y la Política de Privacidad.'
      );
      return;
    }

    // Validaciones del lado del cliente
    if (!this.registroData.nombre || this.registroData.nombre.trim() === '') {
      this.notificacionService.mostrarError('Campo requerido', 'El nombre es obligatorio.');
      return;
    }

    if (!this.registroData.email || this.registroData.email.trim() === '') {
      this.notificacionService.mostrarError('Campo requerido', 'El email es obligatorio.');
      return;
    }

    if (this.registroData.contrasena !== this.registroData.confirmarContrasena) {
      this.notificacionService.mostrarError('Contraseñas no coinciden', 'Las contraseñas no coinciden.');
      return;
    }

    if (this.registroData.contrasena.length < 6) {
      this.notificacionService.mostrarError('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.loading = true;
  
    // Normalizar teléfono: asegurar que tenga +51
    const datosEnvio = { ...this.registroData };
    if (datosEnvio.telefono && datosEnvio.telefono.trim() !== '') {
      datosEnvio.telefono = this.normalizarTelefono(datosEnvio.telefono);
    } else {
      datosEnvio.telefono = '';
    }
    
    // Llamada a la API de registro
    this.authService.register(datosEnvio).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response && response.success) {
          this.notificacionService.mostrarExito(
            '¡Registro exitoso!', 
            'Usuario registrado correctamente. Redireccionando al login...'
          );
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.notificacionService.mostrarError(
            'Error de registro', 
            response?.message || 'Error al registrar usuario'
          );
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al registrar:', err);
        
        if (err.error && err.error.message) {
          this.notificacionService.mostrarError('Error de registro', err.error.message);
        } else if (err.status === 400) {
          this.notificacionService.mostrarError(
            'Email ya registrado', 
            'El email ya está registrado o los datos son inválidos.'
          );
        } else {
          this.notificacionService.mostrarError(
            'Error de registro', 
            'Error al registrar usuario. Por favor, intenta nuevamente.'
          );
        }
      }
    });
  }

  // Normaliza el teléfono
  normalizarTelefono(telefono: string): string {
    if (!telefono || telefono.trim() === '') {
      return '';
    }

    // Remover espacios
    let telefonoLimpio = telefono.replace(/\s+/g, '');

    // Si empieza con +51, dejarlo tal cual
    if (telefonoLimpio.startsWith('+51')) {
      return telefonoLimpio;
    }

    // Si empieza con + y otro código
    if (telefonoLimpio.startsWith('+')) {
      // Extraer solo los números después del +
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
}
