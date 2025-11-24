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
import { Subscription, interval, Observable } from 'rxjs';
import { ReporteService, ReporteResponse, MetodoPagoInhabilitado } from '../../servicios/reporte.service';
import { CuponAdminService, CuponAdmin, CuponRequest } from '../../servicios/cupon-admin.service';

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
  seccionActiva: string = 'dashboard';

  pedidosHoy = 0;
  ventasHoy = 0;
  productosActivos = 0;
  clientesActivos = 0;

  mostrarModalSalir: boolean = false;
  
  mostrarModalConfirmarEstado: boolean = false;
  cuponParaCambiarEstado: CuponAdmin | null = null;
  nuevoEstadoCupon: boolean = false;
  
  mostrarModalConfirmarEliminar: boolean = false;
  cuponParaEliminar: CuponAdmin | null = null;
  
  mostrarModalConfirmarReactivar: boolean = false;
  metodoPagoParaReactivar: MetodoPagoInhabilitado | null = null;
  
  usuarios: UsuarioAdmin[] = [];
  usuariosFiltrados: UsuarioAdmin[] = [];
  estadisticas: EstadisticasUsuarios | null = null;
  loadingUsuarios: boolean = false;
  errorUsuarios: string | null = null;
  
  terminoBusqueda: string = '';
  filtroRol: string = '';
  
  mostrarModalRol: boolean = false;
  usuarioSeleccionado: UsuarioAdmin | null = null;
  nuevoRolSeleccionado: 'cliente' | 'administrador' | 'repartidor' | null = null;
  mensajeRol: string = '';
  
  mostrarModalEliminar: boolean = false;
  usuarioAEliminar: UsuarioAdmin | null = null;

  mostrarModalEditarPerfil: boolean = false;
  mostrarModalCambiarContrasena: boolean = false;
  datosPerfil = {
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  };
  guardandoPerfil: boolean = false;
  
  perfilAdmin = {
    fechaRegistro: ''
  };
  
  datosContrasena = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };
  mostrarContrasenaActual: boolean = false;
  mostrarNuevaContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;
  guardandoContrasena: boolean = false;
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
  mostrarModalDetalleProblema: boolean = false;
  reporteProblemaSeleccionado: ReporteProblema | null = null;

  reporteActual: ReporteResponse | null = null;
  generandoReporte = false;
  tipoReporteSeleccionado: 'ventas' | 'productos-vendidos' | 'ganancias' | null = null;
  fechaInicioReporte: string = '';
  fechaFinReporte: string = '';
  
  porcentajeCosto: number = 0.70;
  porcentajeCostoEditando: number = 0.70;
  editandoPorcentaje: boolean = false;
  guardandoPorcentaje: boolean = false;

  metodosPagoInhabilitados: MetodoPagoInhabilitado[] = [];
  cargandoInhabilitaciones = false;

  cupones: CuponAdmin[] = [];
  cuponesCargando = false;
  cuponesError: string | null = null;
  
  mostrarModalCupon = false;
  cuponEnEdicion: CuponAdmin | null = null;
  esNuevoCupon = false;
  guardandoCupon = false;
  
  cuponForm: CuponRequest = {
    codigo: '',
    tipoDescuento: 'porcentaje',
    valorDescuento: 0,
    fechaInicio: '',
    fechaFin: '',
    cantidadDisponible: undefined,
    usosMaximosPorUsuario: 1,
    montoMinimoCompra: 0
  };

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private repartidorService: RepartidorService,
    private menuService: MenuService,
    private reporteService: ReporteService,
    private cuponAdminService: CuponAdminService
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
    this.usuario = this.authService.getUsuarioActual();

    this.cargarReportesProblemas();
    this.cargarPorcentajeCosto();
    this.cargarProductos();
    this.cargarMetodosPagoInhabilitados();
    this.cargarCupones();
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
    this.usuarioService.obtenerEstadisticasDashboard().subscribe({
      next: (estadisticas: any) => {
        this.pedidosHoy = estadisticas.pedidosHoy || 0;
        this.ventasHoy = estadisticas.ventasHoy || 0;
        this.clientesActivos = estadisticas.clientesActivos || 0;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas del dashboard:', err);

      }
    });
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

  verDetalleProblema(reporte: ReporteProblema) {
    this.reporteProblemaSeleccionado = reporte;
    this.mostrarModalDetalleProblema = true;
  }

  cerrarModalDetalleProblema() {
    this.mostrarModalDetalleProblema = false;
    this.reporteProblemaSeleccionado = null;
  }

  navegarA(seccion: string, event?: Event) {
    // Prevenir el comportamiento por defecto del enlace
    if (event) {
      event.preventDefault();
    }
    
    this.seccionActiva = seccion;
    
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
        
        if (typeof response === 'object' && response.success) {
          usuario.activo = response.activo;
          this.notificacionService.mostrarExito(
            'Estado actualizado', 
            `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`
          );
        } else {
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

    if (this.filtroRol) {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => 
        usuario.rol === this.filtroRol
      );
    }

    this.usuariosFiltrados = usuariosFiltrados;
  }

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
      this.notificacionService.mostrarError(
        'Error', 
        'Por favor selecciona un rol válido'
      );
      return;
    }

    const nuevoRolNormalizado = this.nuevoRolSeleccionado.toLowerCase();
    
    const rolActual = (this.usuarioSeleccionado.rol || '').toLowerCase();
    if (nuevoRolNormalizado === rolActual) {
      this.notificacionService.mostrarError(
        'Error', 
        'El nuevo rol debe ser diferente al rol actual'
      );
      return;
    }

    this.usuarioService.cambiarRolUsuario(this.usuarioSeleccionado.idUsuario, nuevoRolNormalizado)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notificacionService.mostrarExito(
              'Rol actualizado', 
              'El rol del usuario ha sido actualizado correctamente'
            );
            
            const index = this.usuarios.findIndex(u => u.idUsuario === this.usuarioSeleccionado!.idUsuario);
            if (index !== -1) {
              this.usuarios[index].rol = nuevoRolNormalizado as 'cliente' | 'administrador' | 'repartidor' | 'vendedor';
              
              if (this.usuarioSeleccionado && this.usuarioSeleccionado.idUsuario === this.usuarios[index].idUsuario) {
                this.usuarioSeleccionado.rol = nuevoRolNormalizado as 'cliente' | 'administrador' | 'repartidor' | 'vendedor';
              }
            }
            
            this.aplicarFiltros();
            
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
          let mensajeError = 'No se pudo cambiar el rol del usuario';
          
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (error.message) {
            mensajeError = error.message;
          }
          
          this.notificacionService.mostrarError(
            'Error al cambiar rol', 
            mensajeError
          );
        }
      });
  }

  // Métodos para edición de perfil
  cargarDatosPerfil() {
    if (!this.usuario || !this.usuario.idUsuario) {
      return;
    }

    this.usuarioService.obtenerPerfil(this.usuario.idUsuario).subscribe({
      next: (response: any) => {
        if (response) {
          let telefonoMostrar = response.telefono || '';
          if (telefonoMostrar && telefonoMostrar.startsWith('+51')) {
            telefonoMostrar = telefonoMostrar.substring(3);
          }
          
          this.datosPerfil = {
            nombre: response.nombre || this.usuario?.nombre || '',
            apellido: response.apellido || this.usuario?.apellido || '',
            telefono: telefonoMostrar,
            direccion: response.direccion || this.usuario?.direccion || ''
          };
          
          // Guardar fecha de registro
          if (response.fechaRegistro) {
            this.perfilAdmin.fechaRegistro = response.fechaRegistro;
          }
        }
      },
      error: (err: any) => {
        console.error('Error al cargar datos del perfil:', err);
        // Si falla, usar datos del usuario actual
        if (this.usuario) {
          let telefonoMostrar = this.usuario.telefono || '';
          if (telefonoMostrar && telefonoMostrar.startsWith('+51')) {
            telefonoMostrar = telefonoMostrar.substring(3);
          }
          
          this.datosPerfil = {
            nombre: this.usuario.nombre || '',
            apellido: this.usuario.apellido || '',
            telefono: telefonoMostrar,
            direccion: this.usuario.direccion || ''
          };
          
          if (this.usuario.fechaRegistro) {
            this.perfilAdmin.fechaRegistro = this.usuario.fechaRegistro;
          }
        }
      }
    });
  }

  abrirModalEditarPerfil() {
    if (this.usuario) {
      let telefonoMostrar = this.usuario.telefono || '';
      if (telefonoMostrar && telefonoMostrar.startsWith('+51')) {
        telefonoMostrar = telefonoMostrar.substring(3);
      }
      
      this.datosPerfil = {
        nombre: this.usuario.nombre || '',
        apellido: this.usuario.apellido || '',
        telefono: telefonoMostrar,
        direccion: this.usuario.direccion || ''
      };
    }
    this.mostrarModalEditarPerfil = true;
  }

  cerrarModalEditarPerfil() {
    this.mostrarModalEditarPerfil = false;
  }

  abrirModalCambiarContrasena() {
    this.datosContrasena = {
      contrasenaActual: '',
      nuevaContrasena: '',
      confirmarContrasena: ''
    };
    this.mostrarContrasenaActual = false;
    this.mostrarNuevaContrasena = false;
    this.mostrarConfirmarContrasena = false;
    this.mostrarModalCambiarContrasena = true;
  }

  cerrarModalCambiarContrasena() {
    this.mostrarModalCambiarContrasena = false;
  }

  guardarPerfil() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al usuario');
      return;
    }

    if (!this.datosPerfil.nombre.trim()) {
      this.notificacionService.mostrarError('Error', 'El nombre es requerido');
      return;
    }
    
    if (!this.datosPerfil.apellido.trim()) {
      this.notificacionService.mostrarError('Error', 'El apellido es requerido');
      return;
    }
    
    if (this.datosPerfil.telefono.trim() && !this.validarTelefono(this.datosPerfil.telefono.trim())) {
      this.notificacionService.mostrarError('Error', 'El teléfono debe tener un formato válido');
      return;
    }
    
    if (!this.datosPerfil.direccion.trim()) {
      this.notificacionService.mostrarError('Error', 'La dirección es requerida');
      return;
    }

    this.guardandoPerfil = true;

    let telefonoNormalizado = this.datosPerfil.telefono.trim();
    if (telefonoNormalizado && telefonoNormalizado !== '') {
      telefonoNormalizado = this.normalizarTelefono(telefonoNormalizado);
    } else {
      telefonoNormalizado = '';
    }
    
    const datosActualizacion = {
      nombre: this.datosPerfil.nombre.trim(),
      apellido: this.datosPerfil.apellido.trim(),
      telefono: telefonoNormalizado,
      direccion: this.datosPerfil.direccion.trim()
    };

    this.usuarioService.actualizarPerfil(this.usuario.idUsuario, datosActualizacion).subscribe({
      next: (response: any) => {
        this.guardandoPerfil = false;
        
        if (response && response.success) {
          this.notificacionService.mostrarExito('Éxito', response.mensaje || 'Perfil actualizado correctamente');
          
          if (response.usuario) {
            const usuarioActualizado: Usuario = {
              idUsuario: response.usuario.idUsuario,
              nombre: response.usuario.nombre,
              apellido: response.usuario.apellido,
              email: response.usuario.email,
              username: response.usuario.username || this.usuario?.username,
              telefono: response.usuario.telefono,
              direccion: response.usuario.direccion,
              rol: response.usuario.rol as any,
              activo: true
            };
            this.authService.actualizarUsuarioActual(usuarioActualizado);
            this.usuario = usuarioActualizado;
          }
          
          this.mostrarModalEditarPerfil = false;
        } else {
          this.notificacionService.mostrarError('Error', response?.mensaje || 'Error al actualizar el perfil');
        }
      },
      error: (err: any) => {
        this.guardandoPerfil = false;
        console.error('Error al actualizar perfil:', err);
        
        if (err.error && err.error.mensaje) {
          this.notificacionService.mostrarError('Error', err.error.mensaje);
        } else if (err.status === 404) {
          this.notificacionService.mostrarError('Error', 'Usuario no encontrado');
        } else if (err.status === 400) {
          this.notificacionService.mostrarError('Error', 'Datos inválidos. Verifica la información ingresada');
        } else {
          this.notificacionService.mostrarError('Error', 'Error al actualizar el perfil. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  validarTelefono(telefono: string): boolean {
    if (!telefono || telefono.trim() === '') {
      return true; // Teléfono es opcional
    }
    const soloNumeros = telefono.replace(/\D/g, '');
    return soloNumeros.length >= 9 && soloNumeros.length <= 12;
  }

  normalizarTelefono(telefono: string): string {
    if (!telefono || telefono.trim() === '') {
      return '';
    }

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

    const soloNumeros = telefonoLimpio.replace(/\D/g, '');
    if (soloNumeros.length > 0) {
      return '+51' + soloNumeros;
    }

    return '+51';
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

  guardarNuevaContrasena() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al usuario');
      return;
    }

    if (!this.datosContrasena.contrasenaActual.trim()) {
      this.notificacionService.mostrarError('Error', 'La contraseña actual es requerida');
      return;
    }
    
    if (!this.datosContrasena.nuevaContrasena.trim()) {
      this.notificacionService.mostrarError('Error', 'La nueva contraseña es requerida');
      return;
    }
    
    if (this.datosContrasena.nuevaContrasena.length < 6) {
      this.notificacionService.mostrarError('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (this.datosContrasena.nuevaContrasena !== this.datosContrasena.confirmarContrasena) {
      this.notificacionService.mostrarError('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    if (this.datosContrasena.contrasenaActual === this.datosContrasena.nuevaContrasena) {
      this.notificacionService.mostrarError('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    this.guardandoContrasena = true;

    this.authService.cambiarContrasena(
      this.usuario.idUsuario,
      this.datosContrasena.contrasenaActual,
      this.datosContrasena.nuevaContrasena
    ).subscribe({
      next: (response: any) => {
        this.guardandoContrasena = false;
        
        if (response.success) {
          this.notificacionService.mostrarExito('Éxito', 'Contraseña actualizada correctamente');
          
          // Limpiar formulario
          this.datosContrasena = {
            contrasenaActual: '',
            nuevaContrasena: '',
            confirmarContrasena: ''
          };
          
          this.mostrarModalCambiarContrasena = false;
        } else {
          this.notificacionService.mostrarError('Error', response.mensaje || 'Error al cambiar la contraseña');
        }
      },
      error: (err: any) => {
        this.guardandoContrasena = false;
        console.error('Error al cambiar contraseña:', err);
        
        if (err.status === 401 && err.error?.mensaje) {
          this.notificacionService.mostrarError('Error', err.error.mensaje);
        } else if (err.status === 400 && err.error?.mensaje) {
          this.notificacionService.mostrarError('Error', err.error.mensaje);
        } else {
          this.notificacionService.mostrarError('Error', 'Error al cambiar la contraseña. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  // ==================== MÉTODOS DE REPORTES ====================
  
  generarReporte() {
    if (!this.tipoReporteSeleccionado || !this.usuario?.idUsuario) {
      this.notificacionService.mostrarError('Error', 'Debe seleccionar un tipo de reporte');
      return;
    }

    if (!this.fechaInicioReporte || !this.fechaFinReporte) {
      this.notificacionService.mostrarError('Error', 'Debe seleccionar fecha de inicio y fecha de fin');
      return;
    }

    this.generandoReporte = true;
    this.reporteActual = null;

    const fechaInicio = this.fechaInicioReporte;
    const fechaFin = this.fechaFinReporte;

    let request: Observable<ReporteResponse>;

    switch (this.tipoReporteSeleccionado) {
      case 'ventas':
        request = this.reporteService.generarReporteVentas(this.usuario.idUsuario, fechaInicio, fechaFin);
        break;
      case 'productos-vendidos':
        request = this.reporteService.generarReporteProductosVendidos(this.usuario.idUsuario, fechaInicio, fechaFin);
        break;
      case 'ganancias':
        request = this.reporteService.generarReporteGanancias(this.usuario.idUsuario, fechaInicio, fechaFin);
        break;
      default:
        this.generandoReporte = false;
        return;
    }

    request.subscribe({
      next: (reporte) => {
        this.reporteActual = reporte;
        this.generandoReporte = false;
        this.notificacionService.mostrarExito('Reporte generado', 'El reporte se ha generado correctamente');
      },
      error: (err) => {
        this.generandoReporte = false;
        console.error('Error al generar reporte:', err);
        const mensaje = err.error?.mensaje || 'Error al generar el reporte';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
  }

  limpiarReporte() {
    this.reporteActual = null;
    this.tipoReporteSeleccionado = null;
    this.fechaInicioReporte = '';
    this.fechaFinReporte = '';
  }

  cargarPorcentajeCosto() {
    this.reporteService.obtenerPorcentajeCosto().subscribe({
      next: (response) => {
        this.porcentajeCosto = response.porcentaje;
        this.porcentajeCostoEditando = response.porcentaje;
      },
      error: (err) => {
        console.error('Error al cargar porcentaje de costo:', err);
      }
    });
  }

  iniciarEdicionPorcentaje() {
    this.porcentajeCostoEditando = this.porcentajeCosto;
    this.editandoPorcentaje = true;
  }

  cancelarEdicionPorcentaje() {
    this.porcentajeCostoEditando = this.porcentajeCosto;
    this.editandoPorcentaje = false;
  }

  guardarPorcentajeCosto() {
    if (this.porcentajeCostoEditando < 0 || this.porcentajeCostoEditando > 1) {
      this.notificacionService.mostrarError('Error', 'El porcentaje debe estar entre 0 y 1 (ej: 0.60 = 60%)');
      return;
    }

    this.guardandoPorcentaje = true;
    this.reporteService.actualizarPorcentajeCosto(this.porcentajeCostoEditando).subscribe({
      next: (response) => {
        this.porcentajeCosto = response.porcentaje;
        this.editandoPorcentaje = false;
        this.guardandoPorcentaje = false;
        this.notificacionService.mostrarExito('Configuración actualizada', 'El porcentaje de costo se ha actualizado correctamente');
      },
      error: (err) => {
        this.guardandoPorcentaje = false;
        const mensaje = err.error?.mensaje || 'Error al actualizar el porcentaje de costo';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
  }

  cargarMetodosPagoInhabilitados() {
    this.cargandoInhabilitaciones = true;
    this.reporteService.obtenerInhabilitacionesActivas().subscribe({
      next: (inhabilitaciones) => {
        this.metodosPagoInhabilitados = inhabilitaciones;
        this.cargandoInhabilitaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar inhabilitaciones:', err);
        this.cargandoInhabilitaciones = false;
        this.notificacionService.mostrarError('Error', 'No se pudieron cargar las inhabilitaciones');
      }
    });
  }

  reactivarMetodoPago(inhabilitacion: MetodoPagoInhabilitado) {
    if (!this.usuario?.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al administrador');
      return;
    }

    this.metodoPagoParaReactivar = inhabilitacion;
    this.mostrarModalConfirmarReactivar = true;
  }

  cerrarModalConfirmarReactivar() {
    this.mostrarModalConfirmarReactivar = false;
    this.metodoPagoParaReactivar = null;
  }

  confirmarReactivarMetodoPago() {
    if (!this.metodoPagoParaReactivar || !this.usuario) {
      return;
    }

    this.reporteService.reactivarMetodoPago(this.metodoPagoParaReactivar.idInhabilitacion, this.usuario.idUsuario).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.mostrarExito('Método reactivado', 'El método de pago ha sido reactivado correctamente');
          this.cargarMetodosPagoInhabilitados();
          this.cerrarModalConfirmarReactivar();
        } else {
          this.notificacionService.mostrarError('Error', response.mensaje || 'No se pudo reactivar el método de pago');
        }
      },
      error: (err) => {
        console.error('Error al reactivar método de pago:', err);
        const mensaje = err.error?.mensaje || 'Error al reactivar el método de pago';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
  }

  cargarCupones() {
    this.cuponesCargando = true;
    this.cuponesError = null;
    
    this.cuponAdminService.obtenerTodosLosCupones().subscribe({
      next: (cupones) => {
        this.cupones = cupones;
        this.cuponesCargando = false;
      },
      error: (err) => {
        console.error('Error al cargar cupones:', err);
        this.cuponesError = 'No se pudieron cargar los cupones';
        this.cuponesCargando = false;
        this.notificacionService.mostrarError('Error', 'No se pudieron cargar los cupones');
      }
    });
  }

  nuevoCupon() {
    this.esNuevoCupon = true;
    this.cuponEnEdicion = null;
    this.cuponForm = {
      codigo: '',
      tipoDescuento: 'porcentaje',
      valorDescuento: 0,
      fechaInicio: '',
      fechaFin: '',
      cantidadDisponible: undefined,
      usosMaximosPorUsuario: 1,
      montoMinimoCompra: 0
    };
    this.mostrarModalCupon = true;
  }

  editarCupon(cupon: CuponAdmin) {
    this.esNuevoCupon = false;
    this.cuponEnEdicion = cupon;
    this.cuponForm = {
      codigo: cupon.codigo,
      tipoDescuento: cupon.tipoDescuento,
      valorDescuento: cupon.valorDescuento,
      fechaInicio: cupon.fechaInicio,
      fechaFin: cupon.fechaFin,
      cantidadDisponible: cupon.cantidadDisponible,
      usosMaximosPorUsuario: cupon.usosMaximosPorUsuario,
      montoMinimoCompra: cupon.montoMinimoCompra
    };
    this.mostrarModalCupon = true;
  }

  guardarCupon() {
    if (!this.usuario?.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al administrador');
      return;
    }

    if (!this.cuponForm.codigo || this.cuponForm.codigo.trim() === '') {
      this.notificacionService.mostrarError('Error', 'El código del cupón es obligatorio');
      return;
    }

    if (!this.cuponForm.fechaInicio || !this.cuponForm.fechaFin) {
      this.notificacionService.mostrarError('Error', 'Las fechas de inicio y fin son obligatorias');
      return;
    }

    if (this.cuponForm.valorDescuento <= 0) {
      this.notificacionService.mostrarError('Error', 'El valor de descuento debe ser mayor a 0');
      return;
    }

    this.guardandoCupon = true;

    if (this.esNuevoCupon) {
      this.cuponAdminService.crearCupon(this.cuponForm, this.usuario.idUsuario).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacionService.mostrarExito('Cupón creado', 'El cupón se ha creado correctamente');
            this.cerrarModalCupon();
            this.cargarCupones();
          } else {
            this.notificacionService.mostrarError('Error', response.mensaje || 'No se pudo crear el cupón');
          }
          this.guardandoCupon = false;
        },
        error: (err) => {
          console.error('Error al crear cupón:', err);
          const mensaje = err.error?.mensaje || 'Error al crear el cupón';
          this.notificacionService.mostrarError('Error', mensaje);
          this.guardandoCupon = false;
        }
      });
    } else {
      if (!this.cuponEnEdicion) return;
      
      this.cuponAdminService.actualizarCupon(this.cuponEnEdicion.idCupon, this.cuponForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificacionService.mostrarExito('Cupón actualizado', 'El cupón se ha actualizado correctamente');
            this.cerrarModalCupon();
            this.cargarCupones();
          } else {
            this.notificacionService.mostrarError('Error', response.mensaje || 'No se pudo actualizar el cupón');
          }
          this.guardandoCupon = false;
        },
        error: (err) => {
          console.error('Error al actualizar cupón:', err);
          const mensaje = err.error?.mensaje || 'Error al actualizar el cupón';
          this.notificacionService.mostrarError('Error', mensaje);
          this.guardandoCupon = false;
        }
      });
    }
  }

  cambiarEstadoCupon(cupon: CuponAdmin) {
    this.cuponParaCambiarEstado = cupon;
    this.nuevoEstadoCupon = !cupon.activo;
    this.mostrarModalConfirmarEstado = true;
  }

  cerrarModalConfirmarEstado() {
    this.mostrarModalConfirmarEstado = false;
    this.cuponParaCambiarEstado = null;
  }

  confirmarCambiarEstadoCupon() {
    if (!this.cuponParaCambiarEstado) {
      return;
    }

    const accion = this.nuevoEstadoCupon ? 'activar' : 'desactivar';
    this.cuponAdminService.cambiarEstadoCupon(this.cuponParaCambiarEstado.idCupon, this.nuevoEstadoCupon).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.mostrarExito('Estado actualizado', `El cupón ha sido ${accion}do correctamente`);
          this.cargarCupones();
          this.cerrarModalConfirmarEstado();
        } else {
          this.notificacionService.mostrarError('Error', response.mensaje || 'No se pudo cambiar el estado');
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        const mensaje = err.error?.mensaje || 'Error al cambiar el estado del cupón';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
  }

  eliminarCupon(cupon: CuponAdmin) {
    this.cuponParaEliminar = cupon;
    this.mostrarModalConfirmarEliminar = true;
  }

  cerrarModalConfirmarEliminar() {
    this.mostrarModalConfirmarEliminar = false;
    this.cuponParaEliminar = null;
  }

  confirmarEliminarCupon() {
    if (!this.cuponParaEliminar) {
      return;
    }

    this.cuponAdminService.eliminarCupon(this.cuponParaEliminar.idCupon).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificacionService.mostrarExito('Cupón eliminado', 'El cupón ha sido eliminado correctamente');
          this.cargarCupones();
          this.cerrarModalConfirmarEliminar();
        } else {
          this.notificacionService.mostrarError('Error', response.mensaje || 'No se pudo eliminar el cupón');
        }
      },
      error: (err) => {
        console.error('Error al eliminar cupón:', err);
        const mensaje = err.error?.mensaje || 'Error al eliminar el cupón';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
  }

  cerrarModalCupon() {
    this.mostrarModalCupon = false;
    this.cuponEnEdicion = null;
    this.esNuevoCupon = false;
    this.cuponForm = {
      codigo: '',
      tipoDescuento: 'porcentaje',
      valorDescuento: 0,
      fechaInicio: '',
      fechaFin: '',
      cantidadDisponible: undefined,
      usosMaximosPorUsuario: 1,
      montoMinimoCompra: 0,
      activo: true
    };
  }

  formatearTipoDescuento(tipo: string): string {
    return tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo';
  }

  formatearValorDescuento(cupon: CuponAdmin): string {
    if (cupon.tipoDescuento === 'porcentaje') {
      return `${cupon.valorDescuento}%`;
    } else {
      return `S/. ${cupon.valorDescuento.toFixed(2)}`;
    }
  }
}

