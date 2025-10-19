import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DetallePedido, DetallePedidoData } from '../detalle-pedido/detalle-pedido';
import { PedidosService } from '../../servicios/pedidos.service';
import { AuthService } from '../../servicios/auth.service';
import { FiltrosService } from '../../servicios/filtros.service';
import { Pedido, ProductoDetalle } from '../../modelos/pedido.model';


@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule, DetallePedido], 
    templateUrl: './pedidos.html',
    styleUrl: './pedidos.css' 
})
export class Pedidos implements OnInit, OnDestroy { 
    
    // Lista de pedidos que se muestran en la tabla
    listaPedidos: Pedido[] = []; 
    // Almacena la lista completa de pedidos cargados inicialmente
    listaPedidosOriginal: Pedido[] = []; 
    
    isLoading: boolean = true;

    filtroPeriodo: string = 'semana'; 
    filtroEstado: string = 'todos'; 

    // Variables para el modal de detalles
    pedidoSeleccionado: DetallePedidoData | null = null;
    mostrarModalDetalle = false;

    // Suscripción para actualizaciones en tiempo real
    private pedidosSubscription?: Subscription;

    constructor(
        private pedidosService: PedidosService,
        private authService: AuthService,
        private filtrosService: FiltrosService
    ) { }

    ngOnInit(): void {
        this.cargarPedidos();
    }

    ngOnDestroy(): void {
        if (this.pedidosSubscription) {
            this.pedidosSubscription.unsubscribe();
        }
    }

    /* Carga pedidos desde el backend */
    cargarPedidos(): void {
        this.isLoading = true;
        
        // Cargar el usuario actual
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



    /* Aplica los filtros seleccionados (Período y Estado) a la lista de pedidos*/
    aplicarFiltros(): void {
        let pedidosFiltrados = [...this.listaPedidosOriginal];

        if (this.filtroEstado !== 'todos') {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.estadoPedido === this.filtroEstado);
        }

        // Filtrar por PERÍODO usando la fecha actual
        const hoy = new Date(); // Usar la fecha actual real
        let fechaLimite = new Date(hoy);
        
        switch (this.filtroPeriodo) {
            case 'semana':
                fechaLimite.setDate(hoy.getDate() - 7);
                break;
            case 'quinceDias':
                fechaLimite.setDate(hoy.getDate() - 15);
                break;
            case 'treintaDias':
                fechaLimite.setMonth(hoy.getMonth() - 1);
                break;
            case 'tresMeses':
                fechaLimite.setMonth(hoy.getMonth() - 3);
                break;
            case 'seisMeses':
                fechaLimite.setMonth(hoy.getMonth() - 6);
                break;
        }

        pedidosFiltrados = pedidosFiltrados.filter(p => {
            const fechaPedido = new Date(p.fechaPedido);
            return fechaPedido >= fechaLimite;
        });

        // Refrescar la lista visible
        this.listaPedidos = pedidosFiltrados;
    }

    /* Restablece todos los filtros y la lista de pedidos a su estado original */
    limpiarFiltros(): void {
        // Restablecer las variables de filtro 
        this.filtroPeriodo = 'semana'; 
        this.filtroEstado = 'todos'; 

        // Aplicar los filtros de nuevo, lo que reinicia la vista a los valores por defecto
        this.aplicarFiltros();
    }

    /*Devuelve la clase CSS para la insignia de estado*/
    getEstadoClase(estado: string): string {
        switch (estado) {
            case 'Entregado':
                return 'bg-success-light text-success';
            case 'Enviado':
                return 'bg-warning-light text-warning';
            case 'Pendiente':
                return 'bg-info-light text-info';
            default:
                return 'bg-light text-muted';
        }
    }

    /* Abre el modal de detalles del pedido */
    verDetallesPedido(pedido: Pedido): void {
        // Generar un objeto DetallePedido basado en los datos simulados
        this.pedidoSeleccionado = this.crearDetallePedidoSimulado(pedido);
        this.mostrarModalDetalle = true;
    }

    /* Cierra el modal de detalles */
    cerrarModalDetalle(): void {
        this.mostrarModalDetalle = false;
        this.pedidoSeleccionado = null;
    }

    /* Crea un detalle de pedido basado en los datos del servicio */
    private crearDetallePedidoSimulado(pedido: Pedido): DetallePedidoData {
        // Mapear repartidor si existe
        const repartidor = pedido.repartidor ? {
            idRepartidor: pedido.repartidor.idRepartidor || 0,
            nombre: pedido.repartidor.nombre,
            apellido: pedido.repartidor.apellido,
            telefono: pedido.repartidor.telefono || ''
        } : undefined;

        // Mapear productos a ProductoDetalle
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
