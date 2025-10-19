import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; 
import { AuthService } from '../../servicios/auth.service';
import { NotificacionService } from '../../servicios/notificacion.service';

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
  imports: [CommonModule, FormsModule, RouterLink], 
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
    telefono: '',
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
    console.log('Datos de registro enviados:', this.registroData);
    
    // Llamada a la API de registro
    this.authService.register(this.registroData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta del backend:', response);
        
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
}
