import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DetallePedido, DetallePedidoData } from '../detalle-pedido/detalle-pedido';
import { PedidosService } from '../../servicios/pedidos.service';
import { AuthService } from '../../servicios/auth.service';
import { FiltrosService } from '../../servicios/filtros.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { Pedido, ProductoDetalle } from '../../modelos/pedido.model';


@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule, DetallePedido], 
    templateUrl: './pedidos.html',
    styleUrl: './pedidos.css' 
})
export class Pedidos implements OnInit, OnDestroy { 
    
    listaPedidos: Pedido[] = []; 
    listaPedidosOriginal: Pedido[] = []; 
    
    isLoading: boolean = true;

    filtroPeriodo: string = 'semana'; 
    filtroEstado: string = 'todos'; 

    pedidoSeleccionado: DetallePedidoData | null = null;
    mostrarModalDetalle = false;

    mostrarModalCancelar = false;
    pedidoACancelar: number | null = null;

    private pedidosSubscription?: Subscription;

    constructor(
        private pedidosService: PedidosService,
        private authService: AuthService,
        private filtrosService: FiltrosService,
        private notificacionService: NotificacionService
    ) { }

    ngOnInit(): void {
        this.cargarPedidos();
    }

    ngOnDestroy(): void {
        if (this.pedidosSubscription) {
            this.pedidosSubscription.unsubscribe();
        }
    }

    cargarPedidos(): void {
        this.isLoading = true;
        const usuarioActual = this.authService.getCurrentUser();
        if (!usuarioActual) {
            console.error('No hay usuario autenticado');
            this.isLoading = false;
            return;
        }
        
        this.pedidosService.obtenerHistorialPedidos(usuarioActual.idUsuario).subscribe({
            next: (pedidos) => {
                this.listaPedidosOriginal = pedidos;
                this.aplicarFiltros();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error al cargar pedidos:', error);
                this.isLoading = false;
            }
        });
    }

    aplicarFiltros(): void {
        let pedidosFiltrados = [...this.listaPedidosOriginal];

        if (this.filtroEstado !== 'todos') {
            const estadosBackend: { [key: string]: string[] } = {
                'Entregado': ['entregado'],
                'Enviado': ['en_camino', 'en camino'],
                'Pendiente': ['pendiente', 'aceptado', 'en_preparacion']
            };

            const estadosABuscar = estadosBackend[this.filtroEstado] || [this.filtroEstado.toLowerCase()];
            
            pedidosFiltrados = pedidosFiltrados.filter(p => {
                const estadoNormalizado = (p.estadoPedido || '').toLowerCase().trim();
                return estadosABuscar.some(estado => estadoNormalizado === estado.toLowerCase());
            });
        }

        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);
        let fechaLimite = new Date();
        
        switch (this.filtroPeriodo) {
            case 'semana':
                fechaLimite.setDate(hoy.getDate() - 7);
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            case 'quinceDias':
                fechaLimite.setDate(hoy.getDate() - 15);
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            case 'treintaDias':
                fechaLimite.setDate(hoy.getDate() - 30);
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            case 'tresMeses':
                fechaLimite.setMonth(hoy.getMonth() - 3);
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            case 'seisMeses':
                fechaLimite.setMonth(hoy.getMonth() - 6);
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            default:
                fechaLimite = new Date(0);
                break;
        }

        pedidosFiltrados = pedidosFiltrados.filter(p => {
            if (!p.fechaPedido) {
                return false; // Si no hay fecha, excluir el pedido
            }
            
            try {
                const fechaPedido = new Date(p.fechaPedido);
                if (isNaN(fechaPedido.getTime())) {
                    console.warn('Fecha inválida en pedido:', p.idPedido, p.fechaPedido);
                    return false;
                }
                
                fechaPedido.setHours(0, 0, 0, 0);
                return fechaPedido >= fechaLimite;
            } catch (error) {
                console.error('Error al procesar fecha del pedido:', p.idPedido, error);
                return false;
            }
        });

        this.listaPedidos = pedidosFiltrados;
    }

    limpiarFiltros(): void {
        this.filtroPeriodo = 'semana'; 
        this.filtroEstado = 'todos'; 

        // Aplicar los filtros de nuevo, lo que reinicia la vista a los valores por defecto
        this.aplicarFiltros();
    }

    // Devuelve la clase CSS para la insignia de estado
    formatearEstado(estado: string): string {
        if (!estado) return '';
        return String(estado)
            .replace(/_/g, ' ')
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
            .join(' ');
    }

    getEstadoClase(estado: string): string {
        if (!estado) return 'status-default';
        
        const estadoLower = estado.toLowerCase().trim();
        
        switch (estadoLower) {
            case 'pendiente':
                return 'status-pendiente';
            case 'en_curso':
            case 'en curso':
            case 'en_preparacion':
            case 'en preparacion':
                return 'status-en-curso';
            case 'en_camino':
            case 'en camino':
                return 'status-en-camino';
            case 'entregado':
                return 'status-entregado';
            case 'cancelado':
                return 'status-cancelado';
            default:
                return 'status-default';
        }
    }

    verDetallesPedido(pedido: Pedido): void {
        this.pedidoSeleccionado = this.crearDetallePedidoSimulado(pedido);
        this.mostrarModalDetalle = true;
    }

    // Cierra el modal de detalles
    cerrarModalDetalle(): void {
        this.mostrarModalDetalle = false;
        this.pedidoSeleccionado = null;
    }

    puedeCancelar(estado: string): boolean {
        if (!estado) return false;
        const estadoNormalizado = estado.toLowerCase().trim();
        // Estados cancelables: pendiente, aceptado, en_preparacion
        return estadoNormalizado === 'pendiente' || 
               estadoNormalizado === 'aceptado' || 
               estadoNormalizado === 'en_preparacion' ||
               estadoNormalizado === 'en preparacion' ||
               estadoNormalizado === 'enpreparacion';
    }

    // Abre el modal de confirmación para cancelar un pedido
    cancelarPedido(idPedido: number, event: Event): void {
        event.stopPropagation(); // Evitar que se abra el modal de detalles
        this.pedidoACancelar = idPedido;
        this.mostrarModalCancelar = true;
    }

    // Cierra el modal de confirmación
    cerrarModalCancelar(): void {
        this.mostrarModalCancelar = false;
        this.pedidoACancelar = null;
    }

    // Confirma la cancelación del pedido
    confirmarCancelarPedido(): void {
        if (this.pedidoACancelar === null) {
            return;
        }

        const usuarioActual = this.authService.getCurrentUser();
        if (!usuarioActual) {
            console.error('No hay usuario autenticado');
            this.cerrarModalCancelar();
            return;
        }

        this.pedidosService.cancelarPedido(this.pedidoACancelar, usuarioActual.idUsuario).subscribe({
            next: (response) => {
                if (response.success) {
                    this.cerrarModalCancelar();
                    this.cargarPedidos();
                    
                    if (response.metodoPagoInhabilitado && response.nombreMetodoPago) {
                        this.notificacionService.mostrarAdvertencia(
                            'Método de Pago Inhabilitado',
                            `Tu método de pago ${response.nombreMetodoPago} ha sido inhabilitado temporalmente debido a múltiples cancelaciones. Por favor, contacta al administrador para más información.`
                        );
                    } else {
                        this.notificacionService.mostrarExito(
                            'Pedido cancelado',
                            'El pedido ha sido cancelado correctamente'
                        );
                    }
                } else {
                    this.notificacionService.mostrarError('Error', 'Error al cancelar el pedido');
                }
            },
            error: (error) => {
                console.error('Error al cancelar pedido:', error);
                const mensaje = error.error?.mensaje || error.error?.message || 'Error al cancelar el pedido';
                this.notificacionService.mostrarError('Error', mensaje);
                this.cerrarModalCancelar();
            }
        });
    }

    mostrarConfirmacionPago(pedido: Pedido): boolean {
        const metodoPago = (pedido.metodoPago || '').toLowerCase();
        const estado = (pedido.estadoPedido || '').toLowerCase();
        // El cliente puede confirmar cuando el pedido está en curso o en camino (repartidor ya lo aceptó)
        // Se mantiene visible incluso después de confirmar
        return metodoPago === 'efectivo' && 
               (estado === 'en_curso' || estado === 'en_camino' || estado === 'en camino' || 
                estado === 'en_preparacion' || estado === 'en preparacion');
    }

    confirmarPagoEfectivo(idPedido: number, event: Event): void {
        event.stopPropagation();
        
        const usuarioActual = this.authService.getCurrentUser();
        if (!usuarioActual) {
            console.error('No hay usuario autenticado');
            return;
        }

        this.pedidosService.confirmarPagoEfectivo(idPedido, usuarioActual.idUsuario).subscribe({
            next: (response) => {
                if (response.success) {
                    this.cargarPedidos();
                } else {
                    alert('Error al confirmar el pago');
                }
            },
            error: (error) => {
                console.error('Error al confirmar pago:', error);
                const mensaje = error.error?.mensaje || error.error?.message || 'Error al confirmar el pago';
                alert(mensaje);
            }
        });
    }

    private crearDetallePedidoSimulado(pedido: Pedido): DetallePedidoData {
        const repartidor = pedido.repartidor ? {
            idRepartidor: pedido.repartidor.idRepartidor || 0,
            nombre: pedido.repartidor.nombre,
            apellido: pedido.repartidor.apellido,
            telefono: pedido.repartidor.telefono || ''
        } : undefined;

        const productos = (pedido.productos || []).map(detalle => ({
            idDetallePedido: detalle.idDetallePedido,
            idProducto: detalle.idProducto,
            nombre: detalle.nombre,
            descripcion: detalle.descripcion,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.subtotal,
            notasPersonalizacion: detalle.notasPersonalizacion,
            imagenUrl: detalle.imagenUrl,
            categoria: detalle.categoria
        }));

        return {
            idPedido: pedido.idPedido,
            fechaPedido: pedido.fechaPedido,
            estadoPedido: pedido.estadoPedido as any,
            totalPedido: pedido.totalPedido,
            direccionEntrega: pedido.direccionEntrega,
            notasCliente: pedido.notasCliente || '',
            metodoPago: pedido.metodoPago as 'tarjeta' | 'billetera_virtual' | 'efectivo',
            estadoPago: pedido.estadoPago as 'pendiente' | 'pagado' | 'fallido' | 'reembolsado',
            repartidor: repartidor,
            fechaEntrega: pedido.fechaEntrega,
            productos: productos
        };
    }

}
