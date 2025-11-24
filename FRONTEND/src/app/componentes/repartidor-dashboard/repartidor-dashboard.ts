import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { RepartidorService } from '../../servicios/repartidor.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { OneSignalService } from '../../servicios/onesignal.service';
import { Usuario } from '../../modelos/usuario.model';

@Component({
  selector: 'app-repartidor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repartidor-dashboard.html',
  styleUrls: ['./repartidor-dashboard.css']
})
export class RepartidorDashboard implements OnInit, OnDestroy {
  seccionActiva: string = 'dashboard';
  usuario: Usuario | null = null;
  entregasHoy = 0;
  ganadoHoy = 0;
  entregasMes = 0;
  pedidosPendientes = 0;
  pedidosEnCurso = 0;
  pedidosCompletados = 0;
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
  mostrarModalEditarPerfil = false;
  guardando = false;
  datosEdicion = {
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  };
  mostrarModalCambiarContrasena = false;
  guardandoContrasena = false;
  mostrarContrasenaActual = false;
  mostrarNuevaContrasena = false;
  mostrarConfirmarContrasena = false;
  datosContrasena = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };
  pedidos: any[] = [];
  historialEntregas: any[] = [];

  perfilRepartidor = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaRegistro: '',
    totalEntregas: 0,
    gananciaTotal: 0
  };

  tabActivo = 'pendientes';
  private intervaloActualizacion: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private repartidorService: RepartidorService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private oneSignalService: OneSignalService
  ) {}

  ngOnInit() {
    this.cargarDatosRepartidor();
    this.cargarPedidos();
    this.cargarHistorialEntregas();
    this.cargarEstadisticas();
    
    this.intervaloActualizacion = setInterval(() => {
      this.cargarPedidos();
      this.cargarEstadisticas();
    }, 10000);
    
    setTimeout(() => {
      if (this.usuario?.idUsuario && this.usuario?.rol === 'repartidor') {
        this.oneSignalService.inicializarOneSignal(this.usuario.idUsuario).then(playerId => {
          if (playerId) {
            this.configurarListenerNotificaciones();
          }
        }).catch(error => {
          console.error('Error al inicializar OneSignal:', error);
        });
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervaloActualizacion) {
      clearInterval(this.intervaloActualizacion);
    }
  }

  configurarListenerNotificaciones() {
    if (typeof window === 'undefined' || !(window as any).OneSignal) {
      return;
    }

    const OneSignal = (window as any).OneSignal;
    
    if (OneSignal.Notifications?.addEventListener) {
      OneSignal.Notifications.addEventListener('click', (event: any) => {
        const pedidoId = event?.notification?.data?.pedidoId || 
                        event?.notification?.additionalData?.pedidoId ||
                        event?.data?.pedidoId;
        
        if (!pedidoId) return;
        
        this.seccionActiva = 'dashboard';
        this.tabActivo = 'pendientes';
        
        const rutaActual = this.router.url.split('?')[0];
        if (rutaActual !== '/repartidor/dashboard' && rutaActual !== '/repartidor-dashboard') {
          this.router.navigate(['/repartidor/dashboard']).then(() => {
            this.cargarPedidoYAbirModal(Number(pedidoId));
          });
        } else {
          this.cargarPedidoYAbirModal(Number(pedidoId));
        }
      });
      
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', () => {
        this.cargarPedidos();
        this.cargarEstadisticas();
      });
    }
  }

  cargarPedidoYAbirModal(pedidoId: number) {
    const pedidoExistente = this.pedidos.find(p => p.id === pedidoId);
    
    if (pedidoExistente) {
      if (pedidoExistente.estado === 'pendiente') {
        this.pedidoSeleccionado = pedidoExistente;
        this.mostrarModalAceptarPedido = true;
      } else {
        this.tabActivo = 'en_curso';
        this.notificacionService.mostrarInfo('Pedido encontrado', `El pedido #${pedidoId} ya está en curso`);
      }
      return;
    }
    
    this.repartidorService.obtenerPedidosDisponibles().subscribe({
      next: (pedidos: any[]) => {
        const pedidosMapeados = pedidos.map(p => this.mapearPedido(p));
        const pedidoEncontrado = pedidosMapeados.find(p => p.id === pedidoId);
        
        if (pedidoEncontrado) {
          const existeEnLista = this.pedidos.find(p => p.id === pedidoId);
          if (!existeEnLista) {
            this.pedidos.push(pedidoEncontrado);
            this.actualizarContadores();
          }
          
          this.pedidoSeleccionado = pedidoEncontrado;
          this.mostrarModalAceptarPedido = true;
        } else {
          this.notificacionService.mostrarError('Pedido no encontrado', `No se pudo encontrar el pedido #${pedidoId}`);
        }
      },
      error: () => {
        this.notificacionService.mostrarError('Error', 'No se pudo cargar el pedido');
      }
    });
  }



  cargarDatosRepartidor() {
    this.usuario = this.authService.getUsuarioActual();
    if (this.usuario) {
      this.perfilRepartidor.nombre = this.usuario.nombre || '';
      this.perfilRepartidor.apellido = this.usuario.apellido || '';
      this.perfilRepartidor.email = this.usuario.email || '';
      this.perfilRepartidor.telefono = this.usuario.telefono || '';
      this.perfilRepartidor.direccion = this.usuario.direccion || '';
      
      if (this.usuario.idUsuario) {
        this.usuarioService.obtenerPerfil(this.usuario.idUsuario).subscribe({
          next: (response: any) => {
            if (response) {
              if (response.fechaRegistro) {
                this.perfilRepartidor.fechaRegistro = response.fechaRegistro;
              }
            }
          },
          error: (err: any) => {
            if (this.usuario?.fechaRegistro) {
              this.perfilRepartidor.fechaRegistro = this.usuario.fechaRegistro;
            }
          }
        });
      } else if (this.usuario.fechaRegistro) {
        this.perfilRepartidor.fechaRegistro = this.usuario.fechaRegistro;
      }
    }
  }

  cargarPedidos() {
    if (!this.usuario || !this.usuario.idUsuario) {
      return;
    }
    
    let pedidosDisponibles: any[] = [];
    let pedidosAsignados: any[] = [];
    let completados = 0;
    
    const actualizarLista = () => {
      completados++;
      if (completados === 2) {
        const todosPedidos: any[] = [];
        const pedidosMap = new Map<number, any>();
        
        pedidosDisponibles.forEach(p => {
          pedidosMap.set(p.id, p);
        });
        
        pedidosAsignados.forEach(p => {
          pedidosMap.set(p.id, p);
        });
        
        todosPedidos.push(...Array.from(pedidosMap.values()));
        this.pedidos = todosPedidos;
        this.actualizarContadores();
      }
    };
    
    this.repartidorService.obtenerPedidosDisponibles().subscribe({
      next: (pedidos: any[]) => {
        pedidosDisponibles = pedidos.map(p => this.mapearPedido(p));
        actualizarLista();
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        actualizarLista();
      }
    });
    
    this.repartidorService.obtenerMisPedidos(this.usuario.idUsuario).subscribe({
      next: (pedidos: any[]) => {
        pedidosAsignados = pedidos.map(p => this.mapearPedido(p));
        actualizarLista();
      },
      error: (err) => {
        console.error('Error al cargar mis pedidos:', err);
        actualizarLista();
      }
    });
  }

  mapearPedido(pedidoBackend: any): any {
    let estadoFrontend = 'pendiente';
    const estadoBackend = pedidoBackend.estadoPedido || '';
    const estadoNormalizado = estadoBackend.toLowerCase().trim().replace(/\s+/g, '_');
    
    if (estadoNormalizado === 'en_camino' || estadoNormalizado === 'en_camino') {
      estadoFrontend = 'en_curso';
    } else if (estadoNormalizado === 'entregado') {
      estadoFrontend = 'entregado';
    } else if (estadoNormalizado === 'aceptado' || estadoNormalizado === 'en_preparacion' || estadoNormalizado === 'en_preparacion' || estadoNormalizado === 'pendiente') {
      estadoFrontend = 'pendiente';
    }
    
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
      fechaProblema: pedidoBackend.fechaProblema || null,
      montoPagadoCliente: pedidoBackend.montoPagadoCliente ? parseFloat(pedidoBackend.montoPagadoCliente.toString()) : undefined,
      pagoEfectivoConfirmadoPorCliente: pedidoBackend.pagoEfectivoConfirmadoPorCliente || false,
      pagoEfectivoConfirmadoPorRepartidor: pedidoBackend.pagoEfectivoConfirmadoPorRepartidor || false,
      fechaConfirmacionPagoCliente: pedidoBackend.fechaConfirmacionPagoCliente || undefined,
      fechaConfirmacionPagoRepartidor: pedidoBackend.fechaConfirmacionPagoRepartidor || undefined
    };
  }

  actualizarContadores() {
    this.pedidosPendientes = this.obtenerPedidosPorEstado('pendientes').length;
    this.pedidosEnCurso = this.obtenerPedidosPorEstado('en_curso').length;
    this.pedidosCompletados = this.obtenerPedidosPorEstado('completadas').length;
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
  }

  aceptarPedido(pedidoId: number) {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar al repartidor');
      return;
    }

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
          
          const pedidoId = this.pedidoSeleccionado?.id;
          if (pedidoId) {
            const pedidoIndex = this.pedidos.findIndex(p => p.id === pedidoId);
            if (pedidoIndex >= 0) {
              this.pedidos[pedidoIndex].estado = 'en_curso';
            }
          }
          
          this.cargarPedidos();
          
          setTimeout(() => {
            this.tabActivo = 'en_curso';
            this.actualizarContadores();
          }, 300);
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
          this.tabActivo = 'completadas';
          const pedidoIndex = this.pedidos.findIndex(p => p.id === this.pedidoParaEntregar?.id);
          if (pedidoIndex >= 0) {
            this.pedidos[pedidoIndex].estado = 'entregado';
            this.actualizarContadores();
          }
          this.cargarPedidos();
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

  mostrarConfirmacionPagoRepartidor(pedido: any): boolean {
    const metodoPago = (pedido.metodoPago || '').toLowerCase();
    const estado = (pedido.estado || '').toLowerCase();
    return metodoPago === 'efectivo' && 
           (estado === 'en_curso' || estado === 'en_camino' || estado === 'en camino') &&
           pedido.pagoEfectivoConfirmadoPorCliente === true;
  }

  puedeMarcarComoEntregado(pedido: any): boolean {
    const metodoPago = (pedido.metodoPago || '').toLowerCase();
    
    if (metodoPago !== 'efectivo') {
      return true;
    }
    
    return pedido.pagoEfectivoConfirmadoPorCliente === true && 
           pedido.pagoEfectivoConfirmadoPorRepartidor === true;
  }

  calcularVuelto(pedido: any): number {
    if (pedido.metodoPago?.toLowerCase() === 'efectivo' && pedido.montoPagadoCliente && pedido.total) {
      return pedido.montoPagadoCliente - pedido.total;
    }
    return 0;
  }

  confirmarPagoEfectivoRepartidor(idPedido: number, event: Event): void {
    event.stopPropagation();
    
    if (!this.usuario || !this.usuario.idUsuario) {
      console.error('No hay usuario autenticado');
      return;
    }

    this.repartidorService.confirmarPagoEfectivo(idPedido, this.usuario.idUsuario).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificacionService.mostrarExito('Pago confirmado', 'Has confirmado la recepción del pago en efectivo. Ahora puedes marcar el pedido como entregado.');
          this.cargarPedidos();
        } else {
          this.notificacionService.mostrarError('Error', 'Error al confirmar el pago');
        }
      },
      error: (error) => {
        console.error('Error al confirmar pago:', error);
        const mensaje = error.error?.mensaje || error.error?.message || 'Error al confirmar el pago';
        this.notificacionService.mostrarError('Error', mensaje);
      }
    });
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
        this.perfilRepartidor.totalEntregas = estadisticas.totalEntregas || 0;
        this.perfilRepartidor.gananciaTotal = estadisticas.gananciaTotal || 0;
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
    const pedidosFiltrados = this.pedidos.filter(pedido => {
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
    
    return pedidosFiltrados.sort((a, b) => {
      if (b.id && a.id) {
        return b.id - a.id;
      }
      if (b.fechaPedido && a.fechaPedido) {
        const fechaB = new Date(b.fechaPedido).getTime();
        const fechaA = new Date(a.fechaPedido).getTime();
        return fechaB - fechaA;
      }
      return 0;
    });
  }

  navegarA(seccion: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    const seccionesValidas = ['dashboard', 'historial', 'perfil'];
    if (seccionesValidas.includes(seccion)) {
      this.seccionActiva = seccion;
      
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

  abrirModalEditarPerfil() {
    if (this.usuario) {
      this.datosEdicion = {
        nombre: this.usuario.nombre || '',
        apellido: this.usuario.apellido || '',
        telefono: this.usuario.telefono || '',
        direccion: this.usuario.direccion || ''
      };
    }
    this.mostrarModalEditarPerfil = true;
  }

  cerrarModalEditarPerfil() {
    this.mostrarModalEditarPerfil = false;
  }

  guardarCambiosPerfil() {
    if (!this.usuario || !this.usuario.idUsuario) {
      this.notificacionService.mostrarError('Error', 'No se pudo identificar el usuario');
      return;
    }

    if (!this.datosEdicion.nombre || !this.datosEdicion.apellido) {
      this.notificacionService.mostrarError('Error', 'El nombre y apellido son obligatorios');
      return;
    }

    this.guardando = true;

    this.usuarioService.actualizarPerfil(this.usuario.idUsuario, this.datosEdicion).subscribe({
      next: (response: any) => {
        this.guardando = false;
        
        if (response.success) {
          this.notificacionService.mostrarExito('Éxito', 'Información actualizada correctamente');
          
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
          
          this.mostrarModalEditarPerfil = false;
        } else {
          this.notificacionService.mostrarError('Error', response.mensaje || 'Error al actualizar el perfil');
        }
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al actualizar perfil:', err);
        
        if (err.status === 400 && err.error?.mensaje) {
          this.notificacionService.mostrarError('Error', err.error.mensaje);
        } else if (err.status === 404) {
          this.notificacionService.mostrarError('Error', 'Usuario no encontrado');
        } else {
          this.notificacionService.mostrarError('Error', 'Error al actualizar la información. Por favor, intenta nuevamente.');
        }
      }
    });
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
      this.notificacionService.mostrarError('Error', 'No se pudo identificar el usuario');
      return;
    }

    if (!this.datosContrasena.contrasenaActual) {
      this.notificacionService.mostrarError('Error', 'La contraseña actual es obligatoria');
      return;
    }

    if (!this.datosContrasena.nuevaContrasena || this.datosContrasena.nuevaContrasena.length < 6) {
      this.notificacionService.mostrarError('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.datosContrasena.nuevaContrasena !== this.datosContrasena.confirmarContrasena) {
      this.notificacionService.mostrarError('Error', 'Las contraseñas no coinciden');
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
}

