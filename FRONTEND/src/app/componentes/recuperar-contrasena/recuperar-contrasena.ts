import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css'
})
export class RecuperarContrasena {
  email: string = '';

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService) { }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null; 

    // Validación básica
    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    this.loading = true;
    console.log('Solicitando recuperación de contraseña para:', this.email);

    // Llamada al servicio de autenticación
    this.authService.solicitarRecuperacion(this.email)
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (response.success) {
            this.successMessage = response.mensaje || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.';
            this.email = ''; // Limpiar el campo
          } else {
            this.errorMessage = response.mensaje || 'No se pudo procesar tu solicitud.';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al solicitar recuperación:', error);

          if (error.status === 400 && error.error?.mensaje) {
            this.errorMessage = error.error.mensaje;
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.';
          } else {
            this.errorMessage = 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.';
          }
        }
      });
  }
}
