import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, UsuarioAdmin, EstadisticasUsuarios } from '../../servicios/usuario.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { AuthService } from '../../servicios/auth.service';
import { Usuario } from '../../modelos/usuario.model';
import { RepartidorService } from '../../servicios/repartidor.service';
import { MenuService } from '../../servicios/menu.service';
import { Producto } from '../../modelos/producto.model';
import { Subscription, interval } from 'rxjs';

interface ProductoAdmin extends Producto {
  categoriaId?: number;
}

interface CategoriaOpcion {
  id: number;
  nombre: string;
}

interface ReporteProblema {
  idPedido: number;
  clienteNombre: string;
  clienteTelefono: string;
  detalleProblema: string;
  repartidorNombre?: string;
  estadoPedido: string;
  fechaProblema: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit, OnDestroy {
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

  productos: ProductoAdmin[] = [];
  productosFiltrados: ProductoAdmin[] = [];
  productosCargando = false;
  productosError: string | null = null;
  productosPollingSub?: Subscription;
  terminoBusquedaProducto = '';
  mostrarModalEditarProducto = false;
  mostrarModalEliminarProducto = false;
  productoEnEdicion: ProductoAdmin | null = null;
  productoAEliminar: ProductoAdmin | null = null;
  guardandoProducto = false;
  eliminandoProducto = false;
  esNuevoProducto = false;
  categoriasDisponibles: CategoriaOpcion[] = [];

  reportesProblemas: ReporteProblema[] = [];

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
    private authService: AuthService,
    private repartidorService: RepartidorService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
    
    // Obtener usuario actual
    this.usuario = this.authService.getUsuarioActual();

    this.cargarReportesProblemas();
    this.cargarProductos();
    this.productosPollingSub = interval(15000).subscribe(() => this.cargarProductos());
  }

  ngOnDestroy(): void {
    if (this.productosPollingSub) {
      this.productosPollingSub.unsubscribe();
    }
  }
  cargarProductos() {
    this.productosCargando = true;
    this.menuService.obtenerProductosAdmin().subscribe({
      next: (respuesta) => {
        const productosNormalizados: ProductoAdmin[] = (respuesta || []).map((producto) => {
          const categoriaId: number | undefined = typeof producto.categoria === 'object' && producto.categoria
            ? (producto.categoria as any).idCategoria
            : (producto as any).categoriaId ?? undefined;
          const estadoNormalizado = ((producto.estado || 'activo') as string).toLowerCase() as 'activo' | 'inactivo';
          return {
            ...producto,
            stock: producto.stock ?? 0,
            estado: estadoNormalizado,
            imagenUrl: producto.imagenUrl || 'https://placehold.co/300x200/FF6B35/FFFFFF?text=Producto',
            categoriaId
          };
        });

        this.productos = productosNormalizados;
        this.productosFiltrados = this.filtrarProductos(this.terminoBusquedaProducto);
        this.productosActivos = this.productos.filter(producto => producto.estado === 'activo').length;
        this.categoriasDisponibles = this.obtenerCategoriasDisponibles(productosNormalizados);
        this.productosCargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.productosError = 'No se pudieron cargar los productos';
        this.productosCargando = false;
        this.productos = [];
        this.productosFiltrados = [];
      }
    });
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

  cargarReportesProblemas() {
    this.repartidorService.obtenerReportesProblemas().subscribe({
      next: (reportes: ReporteProblema[]) => {
        this.reportesProblemas = reportes ?? [];
      },
      error: () => {
        console.error('No se pudieron cargar los reportes de problemas (el backend puede no exponer este recurso).');
        this.reportesProblemas = [];
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
    this.esNuevoProducto = true;
    const categoriaDefault = this.categoriasDisponibles[0];
    this.productoEnEdicion = {
      idProducto: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: categoriaDefault ? categoriaDefault.nombre : '',
      estado: 'activo',
      stock: 0,
      imagenUrl: '',
      categoriaId: categoriaDefault ? categoriaDefault.id : undefined
    } as ProductoAdmin;
    this.actualizarCategoriaSeleccionada(this.productoEnEdicion.categoriaId);
    this.mostrarModalEditarProducto = true;
  }

  editarProducto(id?: number) {
    if (!id) {
      this.notificacionService.mostrarAdvertencia('Producto', 'No se encontró el identificador del producto.');
      return;
    }
    const producto = this.productos.find(p => p.idProducto === id);
    if (!producto) {
      this.notificacionService.mostrarAdvertencia('Producto', 'No se pudo cargar la información del producto.');
      return;
    }
    this.productoEnEdicion = {
      ...producto,
      categoriaId: producto.categoriaId
    };
    this.esNuevoProducto = false;
    this.actualizarCategoriaSeleccionada(this.productoEnEdicion.categoriaId);
    this.mostrarModalEditarProducto = true;
  }

  eliminarProducto(id?: number) {
    if (!id) {
      this.notificacionService.mostrarAdvertencia('Producto', 'No se encontró el identificador del producto.');
      return;
    }
    const producto = this.productos.find(p => p.idProducto === id);
    if (!producto) {
      this.notificacionService.mostrarAdvertencia('Producto', 'No se pudo cargar la información del producto.');
      return;
    }
    this.productoAEliminar = producto;
    this.mostrarModalEliminarProducto = true;
  }

  buscarProducto(termino: string) {
    this.terminoBusquedaProducto = termino;
    this.productosFiltrados = this.filtrarProductos(termino);
  }

  guardarProductoEditado() {
    if (!this.productoEnEdicion) {
      return;
    }
    const producto = this.productoEnEdicion;
    if (!producto.nombre || !producto.nombre.trim()) {
      this.notificacionService.mostrarAdvertencia('Producto', 'El nombre es obligatorio.');
      return;
    }
    if (!producto.categoriaId) {
      this.notificacionService.mostrarAdvertencia('Producto', 'Selecciona una categoría válida.');
      return;
    }
    if (producto.precio === undefined || producto.precio === null || Number(producto.precio) <= 0) {
      this.notificacionService.mostrarAdvertencia('Producto', 'El precio debe ser mayor a cero.');
      return;
    }
    if (producto.stock === undefined || producto.stock === null || Number(producto.stock) < 0) {
      this.notificacionService.mostrarAdvertencia('Producto', 'El stock no puede ser negativo.');
      return;
    }
    this.guardandoProducto = true;
    const esNuevo = !producto.idProducto;
    this.menuService.guardarProducto({
      idProducto: esNuevo ? undefined : producto.idProducto,
      nombre: producto.nombre.trim(),
      descripcion: producto.descripcion || '',
      precio: Number(producto.precio),
      idCategoria: producto.categoriaId,
      imagenUrl: producto.imagenUrl,
      estado: producto.estado,
      stock: Number(producto.stock)
    }).subscribe({
      next: () => {
        this.notificacionService.mostrarExito('Producto', esNuevo ? 'Producto creado correctamente.' : 'Producto actualizado correctamente.');
        this.guardandoProducto = false;
        this.mostrarModalEditarProducto = false;
        this.productoEnEdicion = null;
        this.esNuevoProducto = false;
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.guardandoProducto = false;
        this.notificacionService.mostrarError('Producto', 'No se pudo actualizar el producto.');
      }
    });
  }

  cancelarEdicionProducto() {
    this.mostrarModalEditarProducto = false;
    this.productoEnEdicion = null;
    this.guardandoProducto = false;
    this.esNuevoProducto = false;
  }

  confirmarEliminacionProducto() {
    if (!this.productoAEliminar || !this.productoAEliminar.idProducto) {
      return;
    }
    this.eliminandoProducto = true;
    this.menuService.eliminarProducto(this.productoAEliminar.idProducto).subscribe({
      next: (respuesta) => {
        this.eliminandoProducto = false;
        this.mostrarModalEliminarProducto = false;
        const mensaje = respuesta?.mensaje || 'Operación realizada.';
        if (respuesta?.accion === 'ELIMINADO') {
          this.notificacionService.mostrarExito('Producto', mensaje);
        } else {
          this.notificacionService.mostrarAdvertencia('Producto', mensaje);
        }
        this.productoAEliminar = null;
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.eliminandoProducto = false;
        this.notificacionService.mostrarError('Producto', 'No se pudo eliminar el producto.');
      }
    });
  }

  cancelarEliminacionProducto() {
    this.mostrarModalEliminarProducto = false;
    this.productoAEliminar = null;
    this.eliminandoProducto = false;
  }

  private filtrarProductos(termino: string): ProductoAdmin[] {
    const filtro = termino.trim().toLowerCase();
    if (!filtro) {
      return [...this.productos];
    }
    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(filtro) ||
      this.obtenerNombreCategoriaProducto(producto).toLowerCase().includes(filtro)
    );
  }

  obtenerNombreCategoriaProducto(producto: ProductoAdmin): string {
    if (!producto.categoria) {
      return 'Sin categoría';
    }
    if (typeof producto.categoria === 'string') {
      return producto.categoria;
    }
    return (producto.categoria as any).nombreCategoria || (producto.categoria as any).nombre || 'Sin categoría';
  }

  actualizarCategoriaSeleccionada(idCategoria?: number | null) {
    if (!this.productoEnEdicion) {
      return;
    }
    const categoriaSeleccionada = this.categoriasDisponibles.find(c => c.id === Number(idCategoria));
    this.productoEnEdicion.categoriaId = idCategoria !== null ? Number(idCategoria) : undefined;
    this.productoEnEdicion.categoria = categoriaSeleccionada ? categoriaSeleccionada.nombre : '';
  }

  private obtenerCategoriasDisponibles(productos: ProductoAdmin[]): CategoriaOpcion[] {
    const mapa = new Map<number, string>();
    productos.forEach(producto => {
      const idCategoria = producto.categoriaId;
      if (idCategoria !== undefined && idCategoria !== null) {
        const nombre = this.obtenerNombreCategoriaProducto(producto);
        if (!mapa.has(idCategoria)) {
          mapa.set(idCategoria, nombre);
        }
      }
    });
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
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

