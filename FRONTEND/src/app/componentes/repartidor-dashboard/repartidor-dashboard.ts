import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { RepartidorService } from '../../servicios/repartidor.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { Usuario } from '../../modelos/usuario.model';

@Component({
  selector: 'app-repartidor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repartidor-dashboard.html',
  styleUrls: ['./repartidor-dashboard.css']
})
export class RepartidorDashboard implements OnInit {
  // Sección activa
  seccionActiva: string = 'dashboard';

  // Información del repartidor (se carga dinámicamente)
  usuario: Usuario | null = null;

  // Estadísticas del día
  entregasHoy = 12;
  ganadoHoy = 180;
  calificacion = 4.8;
  
  // Tendencias
  tendenciaEntregas = 15.2;
  tendenciaGanado = 8.5;

  // Contadores de pedidos (solo para el dashboard)
  pedidosPendientes = 3;
  pedidosEnCurso = 1;
  pedidosCompletados = 0;
  
  // Modal de confirmación
  mostrarModalSalir = false;
  
  // Modo de edición
  modoEdicion = false;
  guardando = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;
  
  // Datos para edición
  datosEdicion = {
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  };
  
  // Modo de cambiar contraseña
  modoCambiarContrasena = false;
  guardandoContrasena = false;
  mensajeErrorContrasena: string | null = null;
  mensajeExitoContrasena: string | null = null;
  
  // Mostrar contraseñas
  mostrarContrasenaActual = false;
  mostrarNuevaContrasena = false;
  mostrarConfirmarContrasena = false;
  
  // Datos para cambiar contraseña
  datosContrasena = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };

  // Pedido actual
  pedidoActual = {
    id: 1847,
    estado: 'PENDIENTE',
    restaurante: 'Restaurant El Buen Sabor',
    direccionEntrega: 'Av. Los Pinos 456, San Isidro',
    cliente: 'María González',
    telefono: '987 654 321'
  };

  // Lista de pedidos
  pedidos = [
    {
      id: 1847,
      estado: 'pendiente',
      restaurante: 'Restaurant El Buen Sabor',
      direccionEntrega: 'Av. Los Pinos 456, San Isidro',
      cliente: 'María González',
      telefono: '987 654 321',
      total: 25.50,
      horaPedido: '14:30'
    },
    {
      id: 1848,
      estado: 'en_curso',
      restaurante: 'Pizza Palace',
      direccionEntrega: 'Jr. Las Flores 123, Miraflores',
      cliente: 'Juan Pérez',
      telefono: '987 123 456',
      total: 18.00,
      horaPedido: '15:15'
    },
    {
      id: 1849,
      estado: 'entregado',
      restaurante: 'Burger King',
      direccionEntrega: 'Av. Arequipa 1234, Lima',
      cliente: 'Ana García',
      telefono: '987 789 012',
      total: 32.00,
      horaPedido: '13:45'
    }
  ];

  // Historial de entregas
  historialEntregas = [
    {
      id: 1840,
      fecha: '2024-01-14',
      cliente: 'Luis Martínez',
      restaurante: 'McDonald\'s',
      total: 28.50,
      calificacion: 5,
      comentario: 'Excelente servicio'
    },
    {
      id: 1841,
      fecha: '2024-01-14',
      cliente: 'Carmen López',
      restaurante: 'KFC',
      total: 22.00,
      calificacion: 4,
      comentario: 'Muy rápido'
    },
    {
      id: 1842,
      fecha: '2024-01-13',
      cliente: 'Roberto Silva',
      restaurante: 'Papa John\'s',
      total: 35.75,
      calificacion: 5,
      comentario: 'Perfecto'
    }
  ];

  // Perfil del repartidor
  perfilRepartidor = {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.repartidor@tienda.com',
    telefono: '987 654 321',
    direccion: 'Av. Principal 123, Lima',
    fechaRegistro: '2024-01-01',
    totalEntregas: 156,
    calificacionPromedio: 4.8,
    gananciaTotal: 2340.50
  };

  tabActivo = 'pendientes';

  constructor(
    private router: Router,
    private authService: AuthService,
    private repartidorService: RepartidorService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.cargarDatosRepartidor();
  }

  cargarDatosRepartidor() {
    // Cargar datos del usuario actual desde AuthService
    this.usuario = this.authService.getUsuarioActual();
    console.log('Usuario cargado:', this.usuario);
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
    this.filtrarPedidos();
  }

  filtrarPedidos() {
    // Lógica para filtrar pedidos según el tab activo
    console.log('Filtrando pedidos por:', this.tabActivo);
  }

  aceptarPedido(pedidoId: number) {
    if (confirm('¿Aceptar este pedido?')) {
      console.log('Aceptando pedido:', pedidoId);
      // Lógica para aceptar pedido
    }
  }

  iniciarEntrega(pedidoId: number) {
    if (confirm('¿Iniciar entrega de este pedido?')) {
      console.log('Iniciando entrega:', pedidoId);
      // Lógica para iniciar entrega
    }
  }

  completarEntrega(pedidoId: number) {
    if (confirm('¿Marcar como entregado?')) {
      console.log('Completando entrega:', pedidoId);
      // Lógica para completar entrega
    }
  }

  salir() {
    this.router.navigate(['/login']);
  }

  obtenerPedidosPorEstado(estado: string) {
    return this.pedidos.filter(pedido => {
      switch(estado) {
        case 'pendientes':
          return pedido.estado === 'pendiente';
        case 'en_curso':
          return pedido.estado === 'en_curso';
        case 'completadas':
          return pedido.estado === 'entregado';
        default:
          return false;
      }
    });
  }

  navegarA(seccion: string, event?: Event) {
    // Prevenir el comportamiento por defecto del enlace
    if (event) {
      event.preventDefault();
    }
    
    // Solo permitir navegación a secciones válidas
    const seccionesValidas = ['dashboard', 'historial', 'perfil'];
    if (seccionesValidas.includes(seccion)) {
      this.seccionActiva = seccion;
      console.log('Navegando a:', seccion);
    }
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

  toggleEditarPerfil() {
    this.modoEdicion = !this.modoEdicion;
    this.mensajeError = null;
    this.mensajeExito = null;
    
    if (this.modoEdicion && this.usuario) {
      // Cargar datos actuales para edición
      this.datosEdicion = {
        nombre: this.usuario.nombre || '',
        apellido: this.usuario.apellido || '',
        telefono: this.usuario.telefono || '',
        direccion: this.usuario.direccion || ''
      };
    }
  }

  guardarCambiosPerfil() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.mensajeError = 'No se pudo identificar el usuario';
      return;
    }

    // Validar campos
    if (!this.datosEdicion.nombre || !this.datosEdicion.apellido) {
      this.mensajeError = 'El nombre y apellido son obligatorios';
      return;
    }

    this.guardando = true;
    this.mensajeError = null;
    this.mensajeExito = null;

    this.usuarioService.actualizarPerfil(this.usuario.idUsuario, this.datosEdicion).subscribe({
      next: (response: any) => {
        this.guardando = false;
        console.log('Perfil actualizado:', response);
        
        if (response.success) {
          this.mensajeExito = 'Información actualizada correctamente';
          
          // Actualizar datos del usuario en memoria y AuthService
          if (this.usuario && response.usuario) {
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
            
            this.usuario = usuarioActualizado;
            this.authService.actualizarUsuarioActual(usuarioActualizado);
            console.log('Usuario actualizado en AuthService (repartidor)');
          }
          
          // Cerrar formulario después de 2 segundos
          setTimeout(() => {
            this.modoEdicion = false;
            this.mensajeExito = null;
          }, 2000);
        } else {
          this.mensajeError = response.mensaje || 'Error al actualizar el perfil';
        }
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al actualizar perfil:', err);
        
        if (err.status === 400 && err.error?.mensaje) {
          this.mensajeError = err.error.mensaje;
        } else if (err.status === 404) {
          this.mensajeError = 'Usuario no encontrado';
        } else {
          this.mensajeError = 'Error al actualizar la información. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  toggleCambiarContrasena() {
    this.modoCambiarContrasena = !this.modoCambiarContrasena;
    this.mensajeErrorContrasena = null;
    this.mensajeExitoContrasena = null;
    
    if (this.modoCambiarContrasena) {
      // Limpiar datos del formulario
      this.datosContrasena = {
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
      };
      // Restablecer visibilidad de contraseñas
      this.mostrarContrasenaActual = false;
      this.mostrarNuevaContrasena = false;
      this.mostrarConfirmarContrasena = false;
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

  guardarNuevaContrasena() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.mensajeErrorContrasena = 'No se pudo identificar el usuario';
      return;
    }

    // Validar campos
    if (!this.datosContrasena.contrasenaActual) {
      this.mensajeErrorContrasena = 'La contraseña actual es obligatoria';
      return;
    }

    if (!this.datosContrasena.nuevaContrasena || this.datosContrasena.nuevaContrasena.length < 6) {
      this.mensajeErrorContrasena = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.datosContrasena.nuevaContrasena !== this.datosContrasena.confirmarContrasena) {
      this.mensajeErrorContrasena = 'Las contraseñas no coinciden';
      return;
    }

    this.guardandoContrasena = true;
    this.mensajeErrorContrasena = null;
    this.mensajeExitoContrasena = null;

    this.authService.cambiarContrasena(
      this.usuario.idUsuario,
      this.datosContrasena.contrasenaActual,
      this.datosContrasena.nuevaContrasena
    ).subscribe({
      next: (response: any) => {
        this.guardandoContrasena = false;
        console.log('Contraseña actualizada:', response);
        
        if (response.success) {
          this.mensajeExitoContrasena = 'Contraseña actualizada correctamente';
          
          // Limpiar formulario
          this.datosContrasena = {
            contrasenaActual: '',
            nuevaContrasena: '',
            confirmarContrasena: ''
          };
          
          // Cerrar formulario después de 2 segundos
          setTimeout(() => {
            this.modoCambiarContrasena = false;
            this.mensajeExitoContrasena = null;
          }, 2000);
        } else {
          this.mensajeErrorContrasena = response.mensaje || 'Error al cambiar la contraseña';
        }
      },
      error: (err: any) => {
        this.guardandoContrasena = false;
        console.error('Error al cambiar contraseña:', err);
        
        if (err.status === 401 && err.error?.mensaje) {
          this.mensajeErrorContrasena = err.error.mensaje;
        } else if (err.status === 400 && err.error?.mensaje) {
          this.mensajeErrorContrasena = err.error.mensaje;
        } else {
          this.mensajeErrorContrasena = 'Error al cambiar la contraseña. Por favor, intenta nuevamente.';
        }
      }
    });
  }
}

