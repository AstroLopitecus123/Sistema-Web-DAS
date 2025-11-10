import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { RepartidorService } from '../../servicios/repartidor.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { NotificacionService } from '../../servicios/notificacion.service';
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

  // Estadísticas del día (se cargan dinámicamente desde el backend)
  entregasHoy = 0;
  ganadoHoy = 0;
  entregasMes = 0;

  // Contadores de pedidos (se calculan dinámicamente)
  pedidosPendientes = 0;
  pedidosEnCurso = 0;
  pedidosCompletados = 0;
  
  // Modal de confirmación
  mostrarModalSalir = false;
  mostrarModalAceptarPedido = false;
  mostrarModalEntregarPedido = false;
  mostrarModalReporteProblema = false;
  mostrarModalHistorialCliente = false;
  pedidoSeleccionado: any | null = null;
  pedidoParaEntregar: any | null = null;
  pedidoParaReporte: any | null = null;
  clienteHistorialSeleccionado: { id: number | null; nombre: string; telefono: string } = {
    id: null,
    nombre: '',
    telefono: ''
  };
  historialClientePedidos: any[] = [];
  cargandoHistorialCliente = false;
  mensajeHistorialCliente: string | null = null;
  descripcionProblema: string = '';
  enviandoReporte = false;
  
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

  // Lista de pedidos 
  pedidos: any[] = [];

  // Historial de entregas
  historialEntregas: any[] = [];

  // Perfil del repartidor
  perfilRepartidor = {
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.repartidor@tienda.com',
    telefono: '987 654 321',
    direccion: 'Av. Principal 123, Lima',
    fechaRegistro: '2024-01-01',
    totalEntregas: 156,
    gananciaTotal: 2340.50
  };

  tabActivo = 'pendientes';

  constructor(
    private router: Router,
    private authService: AuthService,
    private repartidorService: RepartidorService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit() {
    this.cargarDatosRepartidor();
    this.cargarPedidos();
    this.cargarHistorialEntregas();
    this.cargarEstadisticas();
  }

  cargarDatosRepartidor() {
    this.usuario = this.authService.getUsuarioActual();
  }

  cargarPedidos() {
    if (!this.usuario || !this.usuario.idUsuario) {
      return;
    }
    this.repartidorService.obtenerPedidosDisponibles().subscribe({
      next: (pedidos: any[]) => {
        this.pedidos = pedidos.map(p => this.mapearPedido(p));
        this.actualizarContadores();
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
      }
    });
    
    this.repartidorService.obtenerMisPedidos(this.usuario.idUsuario).subscribe({
      next: (pedidos: any[]) => {
        const pedidosAsignados = pedidos.map(p => this.mapearPedido(p));
        const todosPedidos = [...this.pedidos];
        pedidosAsignados.forEach(p => {
          const index = todosPedidos.findIndex(ep => ep.id === p.id);
          if (index >= 0) {
            todosPedidos[index] = p;
          } else {
            todosPedidos.push(p);
          }
        });
        this.pedidos = todosPedidos;
        this.actualizarContadores();
      },
      error: (err) => {
        console.error('Error al cargar mis pedidos:', err);
      }
    });
  }

  mapearPedido(pedidoBackend: any): any {
    // Mapear estado del backend al formato del frontend
    let estadoFrontend = 'pendiente';
    const estadoBackend = pedidoBackend.estadoPedido || '';
    
    // Normalizar el estado del backend (en caso de que venga con diferentes formatos)
    const estadoNormalizado = estadoBackend.toLowerCase().trim();
    
    if (estadoNormalizado === 'en_camino' || estadoNormalizado === 'en camino') {
      estadoFrontend = 'en_curso';
    } else if (estadoNormalizado === 'entregado') {
      estadoFrontend = 'entregado';
    } else if (estadoNormalizado === 'aceptado' || estadoNormalizado === 'en_preparacion' || estadoNormalizado === 'en preparacion' || estadoNormalizado === 'pendiente') {
      estadoFrontend = 'pendiente';
    }
    
    // Extraer hora del pedido
    let horaPedido = '';
    if (pedidoBackend.fechaPedido) {
      try {
        const fecha = new Date(pedidoBackend.fechaPedido);
        horaPedido = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        horaPedido = '';
      }
    }
    
    let restaurante = 'Restaurante';
    if (pedidoBackend.productos && pedidoBackend.productos.length > 0) {
      restaurante = 'Restaurante';
    }
    
    return {
      id: pedidoBackend.idPedido,
      estado: estadoFrontend,
      estadoOriginal: pedidoBackend.estadoPedido, 
      restaurante: restaurante,
      direccionEntrega: pedidoBackend.direccionEntrega || '',
      cliente: pedidoBackend.cliente ? 
        `${pedidoBackend.cliente.nombre} ${pedidoBackend.cliente.apellido}` : 'Cliente',
      clienteId: pedidoBackend.cliente?.idUsuario || null,
      telefono: pedidoBackend.cliente?.telefono || '',
      total: pedidoBackend.totalPedido ? parseFloat(pedidoBackend.totalPedido.toString()) : 0,
      horaPedido: horaPedido,
      productos: pedidoBackend.productos || [],
      notasCliente: pedidoBackend.notasCliente || '',
      metodoPago: pedidoBackend.metodoPago || '',
      fechaPedido: pedidoBackend.fechaPedido || '',
      problemaReportado: pedidoBackend.problemaReportado || false,
      detalleProblema: pedidoBackend.detalleProblema || null,
      fechaProblema: pedidoBackend.fechaProblema || null
    };
  }

  actualizarContadores() {
    this.pedidosPendientes = this.obtenerPedidosPorEstado('pendientes').length;
    this.pedidosEnCurso = this.obtenerPedidosPorEstado('en_curso').length;
    this.pedidosCompletados = this.obtenerPedidosPorEstado('completadas').length;
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
    this.filtrarPedidos();
  }

  filtrarPedidos() {
  }

  aceptarPedido(pedidoId: number) {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al repartidor');
      return;
    }

    // Buscar el pedido completo en la lista
    const pedidoCompleto = this.pedidos.find(p => p.id === pedidoId);
    if (!pedidoCompleto) {
      this.notificacionService.mostrarError('Error', 'No se pudo encontrar el pedido');
      return;
    }

    this.pedidoSeleccionado = pedidoCompleto;
    this.mostrarModalAceptarPedido = true;
  }

  cerrarModalAceptarPedido() {
    this.mostrarModalAceptarPedido = false;
    this.pedidoSeleccionado = null;
  }

  confirmarAceptarPedido() {
    if (!this.usuario || !this.usuario.idUsuario || !this.pedidoSeleccionado || !this.pedidoSeleccionado.id) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al repartidor o el pedido');
      this.cerrarModalAceptarPedido();
      return;
    }

    this.repartidorService.aceptarPedido(this.pedidoSeleccionado.id, this.usuario.idUsuario).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificacionService.mostrarExito('Pedido aceptado', 'El pedido ha sido aceptado correctamente');
          this.cerrarModalAceptarPedido();
          
          // Cambiar automáticamente a la pestaña "En Curso" 
          this.tabActivo = 'en_curso';
          
          // Actualizar el pedido en la lista 
          const pedidoIndex = this.pedidos.findIndex(p => p.id === this.pedidoSeleccionado?.id);
          if (pedidoIndex >= 0) {
            this.pedidos[pedidoIndex].estado = 'en_curso';
            this.actualizarContadores();
          }
          
          // Recargar pedidos del servidor para obtener datos actualizados
          this.cargarPedidos();
        } else {
          this.notificacionService.mostrarError('Error', 'Error al aceptar el pedido');
          this.cerrarModalAceptarPedido();
        }
      },
      error: (err) => {
        console.error('Error al aceptar pedido:', err);
        const mensaje = err.error?.mensaje || 'Error al aceptar el pedido';
        this.notificacionService.mostrarError('Error', mensaje);
        this.cerrarModalAceptarPedido();
      }
    });
  }

  iniciarEntrega(pedidoId: number) {
    if (confirm('¿Iniciar entrega de este pedido?')) {
    }
  }

  completarEntrega(pedidoId: number) {
    // Buscar el pedido completo en la lista
    const pedidoCompleto = this.pedidos.find(p => p.id === pedidoId);
    if (!pedidoCompleto) {
      this.notificacionService.mostrarError('Error', 'No se pudo encontrar el pedido');
      return;
    }

    this.pedidoParaEntregar = pedidoCompleto;
    this.mostrarModalEntregarPedido = true;
  }

  cancelarPedido(pedidoId: number) {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al repartidor');
      return;
    }

    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      this.notificacionService.mostrarError('Error', 'No se encontró el pedido');
      return;
    }

    this.repartidorService.cancelarPedido(pedidoId, this.usuario.idUsuario).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificacionService.mostrarInfo('Pedido liberado', 'El pedido ha sido devuelto a la cola de pendientes.');
          const indice = this.pedidos.findIndex(p => p.id === pedidoId);
          if (indice >= 0) {
            this.pedidos[indice].estado = 'pendiente';
            this.pedidos[indice].problemaReportado = false;
            this.pedidos[indice].detalleProblema = null;
            this.pedidos[indice].fechaProblema = null;
          }
          this.actualizarContadores();
          this.tabActivo = 'pendientes';
          this.cargarPedidos();
        } else {
          this.notificacionService.mostrarError('Error', response.mensaje || 'No se pudo cancelar el pedido');
        }
      },
      error: (err) => {
        console.error('Error al cancelar pedido:', err);
        const mensaje = err.error?.mensaje || 'No se pudo cancelar el pedido';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
  }

  abrirModalReporteProblema(pedidoId: number) {
    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      this.notificacionService.mostrarError('Error', 'No se encontró el pedido.');
      return;
    }
    this.pedidoParaReporte = pedido;
    this.descripcionProblema = '';
    this.mostrarModalReporteProblema = true;
  }

  reportarProblema() {
    if (!this.usuario || !this.usuario.idUsuario || !this.pedidoParaReporte) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al repartidor o pedido.');
      return;
    }
    if (!this.descripcionProblema.trim()) {
      this.notificacionService.mostrarError('Reporte', 'Describe brevemente el problema.');
      return;
    }
    this.enviandoReporte = true;
    this.repartidorService.reportarProblema(
      this.pedidoParaReporte.id,
      this.usuario.idUsuario,
      this.descripcionProblema.trim()
    ).subscribe({
      next: (response: any) => {
        this.enviandoReporte = false;
        if (response.success) {
          this.notificacionService.mostrarExito('Problema reportado', 'Se notificó el inconveniente.');
          const index = this.pedidos.findIndex(p => p.id === this.pedidoParaReporte?.id);
          if (index >= 0) {
            this.pedidos[index].problemaReportado = true;
            this.pedidos[index].detalleProblema = this.descripcionProblema.trim();
            this.pedidos[index].fechaProblema = new Date().toISOString();
          }
          this.cerrarModalReporteProblema();
        } else {
          this.notificacionService.mostrarError('Reporte', response.mensaje || 'No se pudo reportar el problema');
        }
      },
      error: (err) => {
        console.error('Error al reportar problema:', err);
        this.enviandoReporte = false;
        const mensaje = err.error?.mensaje || 'No se pudo reportar el problema';
        this.notificacionService.mostrarError('Reporte', mensaje);
      }
    });
  }

  cerrarModalEntregarPedido() {
    this.mostrarModalEntregarPedido = false;
    this.pedidoParaEntregar = null;
  }

  cerrarModalReporteProblema() {
    this.mostrarModalReporteProblema = false;
    this.pedidoParaReporte = null;
    this.descripcionProblema = '';
    this.enviandoReporte = false;
  }

  cerrarModalHistorialCliente() {
    this.mostrarModalHistorialCliente = false;
    this.historialClientePedidos = [];
    this.mensajeHistorialCliente = null;
    this.cargandoHistorialCliente = false;
  }

  confirmarEntregarPedido() {
    if (!this.pedidoParaEntregar || !this.pedidoParaEntregar.id) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar el pedido');
      this.cerrarModalEntregarPedido();
      return;
    }

    this.repartidorService.marcarPedidoComoEntregado(this.pedidoParaEntregar.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificacionService.mostrarExito('Pedido entregado', 'El pedido ha sido marcado como entregado correctamente');
          this.cerrarModalEntregarPedido();
          
          // Cambiar automáticamente a la pestaña "Completadas" 
          this.tabActivo = 'completadas';
          
          // Actualizar el pedido en la lista
          const pedidoIndex = this.pedidos.findIndex(p => p.id === this.pedidoParaEntregar?.id);
          if (pedidoIndex >= 0) {
            this.pedidos[pedidoIndex].estado = 'entregado';
            this.actualizarContadores();
          }
          
          // Recargar pedidos del servidor para obtener datos actualizados
          this.cargarPedidos();
          // Actualizar estadísticas después de marcar como entregado
          this.cargarEstadisticas();
        } else {
          this.notificacionService.mostrarError('Error', 'Error al marcar el pedido como entregado');
          this.cerrarModalEntregarPedido();
        }
      },
      error: (err) => {
        console.error('Error al completar entrega:', err);
        this.notificacionService.mostrarError('Error', 'Error al completar la entrega');
        this.cerrarModalEntregarPedido();
      }
    });
  }

  salir() {
    this.router.navigate(['/login']);
  }

  cargarHistorialEntregas() {
    if (!this.usuario || !this.usuario.idUsuario) {
      return;
    }

    this.repartidorService.obtenerHistorialEntregas(this.usuario.idUsuario).subscribe({
      next: (entregas: any[]) => {
        this.historialEntregas = entregas.map(entrega => ({
          id: entrega.idPedido,
          fecha: entrega.fechaEntrega || entrega.fechaPedido || '',
          cliente: entrega.cliente ? 
            `${entrega.cliente.nombre} ${entrega.cliente.apellido}` : 'Cliente',
          direccionEntrega: entrega.direccionEntrega || '',
          metodoPago: entrega.metodoPago || '',
          total: entrega.totalPedido ? parseFloat(entrega.totalPedido.toString()) : 0
        }));
      },
      error: (err) => {
        console.error('Error al cargar historial de entregas:', err);
        this.historialEntregas = [];
      }
    });
  }

  abrirHistorialCliente(pedido: any) {
    if (!pedido || !pedido.clienteId) {
      this.notificacionService.mostrarError('Historial de cliente', 'No se encontró la información del cliente.');
      return;
    }

    this.clienteHistorialSeleccionado = {
      id: pedido.clienteId,
      nombre: pedido.cliente,
      telefono: pedido.telefono || ''
    };
    this.mostrarModalHistorialCliente = true;
    this.cargandoHistorialCliente = true;
    this.historialClientePedidos = [];
    this.mensajeHistorialCliente = null;

    this.repartidorService.obtenerHistorialCliente(pedido.clienteId, 10).subscribe({
      next: (pedidos: any[]) => {
        this.historialClientePedidos = (pedidos || []).map(p => ({
          id: p.idPedido,
          fecha: this.formatearFechaCorta(p.fechaPedido || p.fechaEntrega),
          direccion: p.direccionEntrega || '',
          total: p.totalPedido ? parseFloat(p.totalPedido) : 0,
          estado: p.estadoPedido || ''
        }));
        if (this.historialClientePedidos.length === 0) {
          this.mensajeHistorialCliente = 'El cliente no tiene pedidos anteriores.';
        }
        this.cargandoHistorialCliente = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de cliente:', err);
        this.mensajeHistorialCliente = err.error?.mensaje || 'No se pudo cargar el historial.';
        this.cargandoHistorialCliente = false;
      }
    });
  }

  cargarEstadisticas() {
    if (!this.usuario || !this.usuario.idUsuario) {
      return;
    }

    this.repartidorService.obtenerEstadisticas(this.usuario.idUsuario).subscribe({
      next: (estadisticas: any) => {
        this.entregasHoy = estadisticas.entregasHoy || 0;
        this.ganadoHoy = estadisticas.ganadoHoy || 0;
        this.entregasMes = estadisticas.entregasMes || 0;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  formatearEstado(estado: string): string {
    if (!estado) return '';
    return String(estado).replace(/_/g, ' ').toUpperCase();
  }

  formatearFechaCorta(fecha?: string): string {
    if (!fecha) {
      return '';
    }
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return fecha;
    }
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
    if (event) {
      event.preventDefault();
    }
    
    // Solo permitir navegación a secciones válidas
    const seccionesValidas = ['dashboard', 'historial', 'perfil'];
    if (seccionesValidas.includes(seccion)) {
      this.seccionActiva = seccion;
      
      // Cargar historial cuando se navega a esa sección
      if (seccion === 'historial') {
        this.cargarHistorialEntregas();
      }
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

