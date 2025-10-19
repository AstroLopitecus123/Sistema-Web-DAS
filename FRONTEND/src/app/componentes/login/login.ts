import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { NotificacionService } from '../../servicios/notificacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  loginData = { email: '', contrasena: '' };
  recordarme: boolean = false;
  errorMessage: string | null = null;
  loading: boolean = false;
  mostrarContrasena: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificacionService: NotificacionService
  ) {}

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  onSubmit(): void {
    // Validar campos
    if (!this.loginData.email || !this.loginData.contrasena) {
      this.notificacionService.mostrarError(
        'Campos requeridos', 
        'Por favor, introduce tu correo y contraseña.'
      );
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Llamar al servicio
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta del backend:', response);
        
        if (response && response.success) {
          // Login exitoso, guardar datos
          this.authService.procesarLoginExitoso(response, this.recordarme);
          
          // Mostrar notificación de éxito
          this.notificacionService.mostrarExito(
            '¡Bienvenido!', 
            'Has iniciado sesión correctamente.'
          );
          
          // Pequeño delay para asegurar que el estado se actualice
          setTimeout(() => {
            // Redirigir según el rol
            this.authService.redirectByRole();
          }, 100);
        } else {
          this.notificacionService.mostrarError(
            'Error de login', 
            response?.message || 'Error en el login'
          );
        }
      },
      error: (err) => {
        this.loading = false;
        
        // Log del error
        console.error('Error completo de Login:', err);
        console.error('Status:', err.status);
        console.error('StatusText:', err.statusText);
        console.error('Error body:', err.error);
        console.error('URL:', err.url);
        
        // Verificar tipo de error
        if (err.status === 403) {
          // Error 403: Cuenta desactivada
          this.notificacionService.mostrarError(
            'Cuenta desactivada', 
            'Tu cuenta ha sido desactivada por un administrador. Contacta con soporte para más información.'
          );
          console.log('Manejando error 403: Cuenta desactivada');
        } else if (err.status === 401) {
          // Error 401: Credenciales inválidas
          this.notificacionService.mostrarError(
            'Credenciales inválidas', 
            'Verifica tu correo y contraseña.'
          );
          console.log('Manejando error 401: Credenciales inválidas');
        } else if (err.status === 400) {
          // Error 400: Datos inválidos
          const mensaje = err.error && err.error.message ? err.error.message : 'Datos de entrada inválidos.';
          this.notificacionService.mostrarError('Datos inválidos', mensaje);
          console.log('Manejando error 400: Datos inválidos');
        } else if (err.status === 0) {
          // Error de conexión (CORS, servidor no disponible, etc.)
          this.notificacionService.mostrarError(
            'Sin conexión', 
            'No se puede conectar con el servidor. Verifica tu conexión a internet.'
          );
          console.log('Manejando error 0: Sin conexión al servidor');
        } else {
          // Otros errores HTTP
          this.notificacionService.mostrarError(
            'Error del servidor', 
            `Error del servidor (${err.status}). Intenta nuevamente.`
          );
          console.log(`Manejando error ${err.status}: Error del servidor`);
        }
      }
    });
  }
}
