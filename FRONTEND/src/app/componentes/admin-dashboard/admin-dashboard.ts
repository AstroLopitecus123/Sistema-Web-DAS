import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, UsuarioAdmin, EstadisticasUsuarios } from '../../servicios/usuario.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { AuthService } from '../../servicios/auth.service';
import { Usuario } from '../../modelos/usuario.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  // Sección activa
  seccionActiva: string = 'dashboard';

  // Métricas del dashboard
  pedidosHoy = 248;
  ventasHoy = 8450;
  productosActivos = 156;
  clientesActivos = 1842;

  // Tendencias
  tendenciaPedidos = 12.5;
  tendenciaVentas = 8.2;
  tendenciaProductos = 3;
  tendenciaClientes = 24;

  // Modal de confirmación
  mostrarModalSalir: boolean = false;
  
  // Gestión de usuarios
  usuarios: UsuarioAdmin[] = [];
  usuariosFiltrados: UsuarioAdmin[] = [];
  estadisticas: EstadisticasUsuarios | null = null;
  loadingUsuarios: boolean = false;
  errorUsuarios: string | null = null;
  
  // Búsqueda y filtros
  terminoBusqueda: string = '';
  filtroRol: string = '';
  
  // Modal cambiar rol
  mostrarModalRol: boolean = false;
  usuarioSeleccionado: UsuarioAdmin | null = null;
  nuevoRolSeleccionado: 'cliente' | 'administrador' | 'repartidor' | null = null;
  mensajeRol: string = '';
  
  // Modal de confirmación de eliminación
  mostrarModalEliminar: boolean = false;
  usuarioAEliminar: UsuarioAdmin | null = null;

  // Cambio de contraseña
  datosContrasena = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };
  mostrarContrasenaActual: boolean = false;
  mostrarNuevaContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;
  guardandoContrasena: boolean = false;
  mensajeExitoContrasena: string | null = null;
  mensajeErrorContrasena: string | null = null;
  usuario: Usuario | null = null;

  // Productos para la tabla
  productos = [
    {
      id: 1,
      nombre: 'Hamburguesa Clásica',
      categoria: 'Hamburguesas',
      precio: 15.00,
      stock: 45,
      estado: 'Disponible',
      imagenUrl: 'https://png.pngtree.com/png-vector/20240715/ourmid/pngtree-hamburger-png-image_13094305.png'
    },
    {
      id: 2,
      nombre: 'Pizza Margherita',
      categoria: 'Pizzas',
      precio: 25.00,
      stock: 30,
      estado: 'Disponible',
      imagenUrl: 'https://placehold.co/300x200/FF6B35/FFFFFF?text=Pizza'
    },
    {
      id: 3,
      nombre: 'Coca Cola',
      categoria: 'Bebidas',
      precio: 5.00,
      stock: 100,
      estado: 'Disponible',
      imagenUrl: 'https://placehold.co/300x200/FF6B35/FFFFFF?text=Coca+Cola'
    }
  ];

  // Pedidos para la sección de pedidos
  pedidos = [
    {
      id: 1,
      cliente: 'José Ogosi',
      productos: 'Hamburguesa Clásica x2',
      total: 30.00,
      estado: 'En Proceso',
      fecha: '2024-01-15'
    },
    {
      id: 2,
      cliente: 'María González',
      productos: 'Pizza Margherita x1',
      total: 25.00,
      estado: 'Entregado',
      fecha: '2024-01-15'
    }
  ];

  // Cupones para la sección de cupones
  cupones = [
    {
      id: 1,
      codigo: 'DESCUENTO10',
      descripcion: '10% de descuento',
      descuento: 10,
      tipo: 'Porcentaje',
      estado: 'Activo',
      fechaVencimiento: '2024-12-31'
    },
    {
      id: 2,
      codigo: 'GRATIS15',
      descripcion: 'S/. 15 de descuento',
      descuento: 15,
      tipo: 'Fijo',
      estado: 'Activo',
      fechaVencimiento: '2024-12-31'
    }
  ];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Cargar datos del dashboard
    this.cargarDatosDashboard();
    
    // Obtener usuario actual
    this.usuario = this.authService.getUsuarioActual();
  }

  cargarDatosDashboard() {
  }
  
  cargarUsuarios() {
    this.loadingUsuarios = true;
    this.errorUsuarios = null;
    
    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios: any) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        this.loadingUsuarios = false;
      },
      error: (error: any) => {
        this.notificacionService.mostrarError(
          'Error al cargar usuarios', 
          'No se pudieron cargar los usuarios'
        );
        this.loadingUsuarios = false;
        console.error('Error al cargar usuarios:', error);
      }
    });
  }
  
  cargarEstadisticas() {
    this.usuarioService.obtenerEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
      },
      error: (error) => {
        this.notificacionService.mostrarError(
          'Error al cargar estadísticas', 
          'No se pudieron cargar las estadísticas'
        );
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  navegarA(seccion: string, event?: Event) {
    // Prevenir el comportamiento por defecto del enlace
    if (event) {
      event.preventDefault();
    }
    
    this.seccionActiva = seccion;
    
    // Cargar datos específicos según la sección
    if (seccion === 'usuarios') {
      this.cargarUsuarios();
      this.cargarEstadisticas();
    }
  }

  nuevoProducto() {
    this.router.navigate(['/admin/productos/nuevo']);
  }

  editarProducto(id: number) {
    this.router.navigate(['/admin/productos/editar', id]);
  }

  eliminarProducto(id: number) {
    this.notificacionService.mostrarAdvertencia(
      'Función no implementada', 
      'La eliminación de productos no está implementada aún'
    );
  }

  buscarProducto(termino: string) {
    // Lógica para buscar productos
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
    this.router.navigate(['/login']);
  }
  
  // Métodos para gestión de usuarios
  confirmarEliminarUsuario(usuario: UsuarioAdmin) {
    this.usuarioAEliminar = usuario;
    this.mostrarModalEliminar = true;
  }
  
  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.usuarioAEliminar = null;
  }
  
  eliminarUsuario() {
    if (!this.usuarioAEliminar) return;
    
    this.usuarioService.eliminarUsuario(this.usuarioAEliminar.idUsuario).subscribe({
      next: (response: any) => {
        
        if (response.success) {
          if (response.accion === 'eliminado') {
            this.notificacionService.mostrarExito(
              'Usuario eliminado', 
              'El usuario ha sido eliminado exitosamente'
            );
          } else if (response.accion === 'desactivado') {
            this.notificacionService.mostrarInfo(
              'Usuario desactivado', 
              'El usuario fue desactivado porque tenía datos relacionados'
            );
          }
          
          // Recargar la lista de usuarios
          this.cargarUsuarios();
          this.cargarEstadisticas();
          this.cerrarModalEliminar();
        } else {
          this.notificacionService.mostrarError(
            'Error al eliminar usuario', 
            response.message || 'Error al eliminar usuario'
          );
          this.cerrarModalEliminar();
        }
      },
      error: (error: any) => {
        console.error('Error al eliminar usuario:', error);
        this.notificacionService.mostrarError(
          'Error al eliminar usuario', 
          'No se pudo eliminar el usuario'
        );
        this.cerrarModalEliminar();
      }
    });
  }
  
  cambiarEstadoUsuario(usuario: UsuarioAdmin) {
    const nuevoEstado = !usuario.activo;
    
    this.usuarioService.cambiarEstadoUsuario(usuario.idUsuario, nuevoEstado).subscribe({
      next: (response: any) => {
        
        // Verificar si la respuesta es JSON o texto
        if (typeof response === 'object' && response.success) {
          // Respuesta JSON del nuevo endpoint
          usuario.activo = response.activo;
          this.notificacionService.mostrarExito(
            'Estado actualizado', 
            `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`
          );
        } else {
          // Respuesta de texto del endpoint anterior
          usuario.activo = nuevoEstado;
          this.notificacionService.mostrarExito(
            'Estado actualizado', 
            `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`
          );
        }
        
        this.cargarEstadisticas();
      },
      error: (error: any) => {
        console.error('Error al cambiar estado:', error);
        this.notificacionService.mostrarError(
          'Error al cambiar estado', 
          'No se pudo cambiar el estado del usuario'
        );
      }
    });
  }
  
  formatearFecha(fecha: string): string {
    return this.usuarioService.formatearFecha(fecha);
  }
  
  obtenerNombreRol(rol: string): string {
    return this.usuarioService.obtenerNombreRol(rol);
  }
  
  obtenerClaseRol(rol: string): string {
    return this.usuarioService.obtenerClaseRol(rol);
  }

  // Métodos de búsqueda y filtrado
  buscarUsuarios() {
    this.aplicarFiltros();
  }

  filtrarPorRol() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let usuariosFiltrados = [...this.usuarios];

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      usuariosFiltrados = usuariosFiltrados.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino) ||
        usuario.apellido.toLowerCase().includes(termino) ||
        usuario.email.toLowerCase().includes(termino)
      );
    }

    // Filtrar por rol
    if (this.filtroRol) {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => 
        usuario.rol === this.filtroRol
      );
    }

    this.usuariosFiltrados = usuariosFiltrados;
  }

  // Métodos del modal de cambio de rol
  mostrarModalCambiarRol(usuario: UsuarioAdmin) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRolSeleccionado = null;
    this.mensajeRol = '';
    this.mostrarModalRol = true;
  }

  cerrarModalRol() {
    this.mostrarModalRol = false;
    this.usuarioSeleccionado = null;
    this.nuevoRolSeleccionado = null;
    this.mensajeRol = '';
  }

  cambiarRolUsuario() {
    if (!this.usuarioSeleccionado || !this.nuevoRolSeleccionado) {
      return;
    }

    this.usuarioService.cambiarRolUsuario(this.usuarioSeleccionado.idUsuario, this.nuevoRolSeleccionado)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notificacionService.mostrarExito(
              'Rol actualizado', 
              'El rol del usuario ha sido actualizado correctamente'
            );
            
            // Actualizar el usuario en la lista local
            const index = this.usuarios.findIndex(u => u.idUsuario === this.usuarioSeleccionado!.idUsuario);
            if (index !== -1 && this.nuevoRolSeleccionado) {
              this.usuarios[index].rol = this.nuevoRolSeleccionado;
            }
            
            // Aplicar filtros nuevamente
            this.aplicarFiltros();
            
            // Cerrar modal después de un breve delay
            setTimeout(() => {
              this.cerrarModalRol();
            }, 1500);
          } else {
            this.notificacionService.mostrarError(
              'Error al cambiar rol', 
              response.message || 'Error al cambiar rol'
            );
          }
        },
        error: (error: any) => {
          console.error('Error al cambiar rol:', error);
          this.notificacionService.mostrarError(
            'Error al cambiar rol', 
            'No se pudo cambiar el rol del usuario'
          );
        }
      });
  }

  // Métodos para cambio de contraseña
  toggleMostrarContrasenaActual() {
    this.mostrarContrasenaActual = !this.mostrarContrasenaActual;
  }

  toggleMostrarNuevaContrasena() {
    this.mostrarNuevaContrasena = !this.mostrarNuevaContrasena;
  }

  toggleMostrarConfirmarContrasena() {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  validarFormularioContrasena(): boolean {
    this.mensajeErrorContrasena = null;

    if (!this.datosContrasena.contrasenaActual.trim()) {
      this.mensajeErrorContrasena = 'La contraseña actual es requerida';
      return false;
    }
    
    if (!this.datosContrasena.nuevaContrasena.trim()) {
      this.mensajeErrorContrasena = 'La nueva contraseña es requerida';
      return false;
    }
    
    if (this.datosContrasena.nuevaContrasena.length < 6) {
      this.mensajeErrorContrasena = 'La nueva contraseña debe tener al menos 6 caracteres';
      return false;
    }
    
    if (this.datosContrasena.nuevaContrasena !== this.datosContrasena.confirmarContrasena) {
      this.mensajeErrorContrasena = 'Las contraseñas no coinciden';
      return false;
    }
    
    if (this.datosContrasena.contrasenaActual === this.datosContrasena.nuevaContrasena) {
      this.mensajeErrorContrasena = 'La nueva contraseña debe ser diferente a la actual';
      return false;
    }

    return true;
  }

  guardarNuevaContrasena() {
    if (!this.validarFormularioContrasena()) {
      return;
    }

    if (!this.usuario || !this.usuario.idUsuario) {
      this.mensajeErrorContrasena = 'No se pudo identificar al usuario';
      return;
    }

    this.guardandoContrasena = true;
    this.mensajeExitoContrasena = null;
    this.mensajeErrorContrasena = null;

    this.authService.cambiarContrasena(
      this.usuario.idUsuario,
      this.datosContrasena.contrasenaActual,
      this.datosContrasena.nuevaContrasena
    ).subscribe({
      next: (response: any) => {
        this.guardandoContrasena = false;
        
        if (response.success) {
          this.mensajeExitoContrasena = 'Contraseña actualizada correctamente';
          
          // Limpiar formulario
          this.datosContrasena = {
            contrasenaActual: '',
            nuevaContrasena: '',
            confirmarContrasena: ''
          };
          
          // Limpiar mensajes después de 3 segundos
          setTimeout(() => {
            this.mensajeExitoContrasena = null;
          }, 3000);
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

