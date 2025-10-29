import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './restablecer-contrasena.html',
  styleUrl: './restablecer-contrasena.css'
})
export class RestablecerContrasena implements OnInit {
  token: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  mostrarNuevaContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      
      if (!this.token) {
        this.errorMessage = 'Token de recuperación no válido.';
      } else {
        console.log('🔑 Token recibido:', this.token);
      }
    });
  }

  toggleMostrarNuevaContrasena(): void {
    this.mostrarNuevaContrasena = !this.mostrarNuevaContrasena;
  }

  toggleMostrarConfirmarContrasena(): void {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Validaciones
    if (!this.token) {
      this.errorMessage = 'Token de recuperación no válido.';
      return;
    }

    if (!this.nuevaContrasena || !this.nuevaContrasena.trim()) {
      this.errorMessage = 'Por favor, ingresa tu nueva contraseña.';
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    console.log('🔄 Restableciendo contraseña...');

    // Llamada al servicio de autenticación
    this.authService.restablecerContrasena(this.token, this.nuevaContrasena).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta del servidor:', response);

        if (response.success) {
          this.successMessage = response.mensaje || 'Tu contraseña ha sido restablecida exitosamente.';
          
          this.nuevaContrasena = '';
          this.confirmarContrasena = '';

          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.mensaje || 'No se pudo restablecer la contraseña.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al restablecer contraseña:', error);

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

