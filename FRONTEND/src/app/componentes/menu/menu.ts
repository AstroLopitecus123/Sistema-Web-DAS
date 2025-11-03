import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MenuService } from '../../servicios/menu.service';
import { FiltrosProductosService } from '../../servicios/filtros-productos.service';
import { Producto, ItemCarrito } from '../../modelos/producto.model';
import { DetalleProducto } from '../detalle-producto/detalle-producto';
import { CarritoService } from '../../servicios/carrito.service';
import { Notificacion, NotificacionData } from '../notificacion/notificacion';
import { UbicacionService, UbicacionSeleccionada } from '../../servicios/ubicacion.service';
import { ModalUbicacionService } from '../../servicios/modal-ubicacion.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, DetalleProducto, Notificacion],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit, OnDestroy {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = true;
  error: string | null = null;
  keyword = '';
  categoriaSeleccionada = 'todos';

  ubicacionSeleccionada: UbicacionSeleccionada | null = null;
  descripcionOrigenUbicacion = {
    gps: 'Detectada por GPS',
    ip: 'Detectada automáticamente',
    autocomplete: 'Seleccionada en el mapa',
    manual: 'Ingresada manualmente'
  } as const;
  private ubicacionSub?: Subscription;

  // Variables para el modal de detalle
  productoSeleccionado: Producto | null = null;
  mostrarModalDetalle = false;

  // Variables para notificaciones
  notificacion: NotificacionData | null = null;
  mostrarNotificacion = false;

  constructor(
    private menuService: MenuService,
    private carritoService: CarritoService,
    private filtrosProductosService: FiltrosProductosService,
    private ubicacionService: UbicacionService,
    private modalUbicacionService: ModalUbicacionService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.ubicacionSeleccionada = this.ubicacionService.obtenerUbicacionActual();
    this.ubicacionSub = this.ubicacionService.obtenerUbicacion().subscribe((ubicacion) => {
      this.ubicacionSeleccionada = ubicacion;
    });
  }

  ngOnDestroy(): void {
    this.ubicacionSub?.unsubscribe();
  }

  cargarProductos(): void {
    this.loading = true;
    this.menuService.obtenerMenuDisponible().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  buscar(): void {
    const filtros = {
      keyword: this.keyword,
      categoria: this.categoriaSeleccionada
    };
    
    this.productosFiltrados = this.filtrosProductosService.filtrarProductos(this.productos, filtros);
  }

  abrirSelectorUbicacion(): void {
    this.modalUbicacionService.abrir();
  }

  addToCart(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.productoSeleccionado = null;
  }

  onAgregarAlCarrito(item: ItemCarrito): void {
    // Añadir al carrito
    this.carritoService.agregarItem(item);
    
    // Mostrar notificación de éxito
    this.mostrarNotificacionExito(item);
  }

  private mostrarNotificacionExito(item: ItemCarrito): void {
    this.notificacion = {
      id: Date.now(),
      mensaje: `¡${item.cantidad} ${item.cantidad === 1 ? 'unidad' : 'unidades'} de ${item.nombre} agregada${item.cantidad === 1 ? '' : 's'} al carrito!`,
      tipo: 'exito',
      duracion: 3000
    } as NotificacionData;
    this.mostrarNotificacion = true;
  }

  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
    this.notificacion = null;
  }

  // Función helper para obtener el nombre de la categoría
  obtenerNombreCategoria(categoria: any): string {
    if (typeof categoria === 'string') {
      return categoria;
    } else if (categoria && categoria.nombre) {
      return categoria.nombre;
    }
    return 'Sin categoría';
  }

  // Filtrar productos por categoría
  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    
    if (categoria === 'todos') {
      this.productosFiltrados = [...this.productos];
    } else {
      // Mapear categorías con diferentes nombres
      const mapeoCategorias: { [key: string]: string[] } = {
        'Hamburguesas': ['Hamburguesas', 'Hamburguesa', 'hamburguesas', 'hamburguesa', 'Comidas', 'comidas'],
        'Bebidas': ['Bebidas', 'Bebida', 'bebidas', 'bebida', 'Bebidas y Refrescos'],
        'Acompañamientos': ['Acompañamientos', 'Acompañamiento', 'acompañamientos', 'acompañamiento', 'Sides', 'sides'],
        'Postres': ['Postres', 'Postre', 'postres', 'postre', 'Desserts', 'desserts'],
        'Ensaladas': ['Ensaladas', 'Ensalada', 'ensaladas', 'ensalada', 'Salads', 'salads']
      };
      
      const categoriasBuscar = mapeoCategorias[categoria] || [categoria];
      
      this.productosFiltrados = this.productos.filter(producto => {
        const nombreCategoria = this.obtenerNombreCategoria(producto.categoria);
        const coincide = categoriasBuscar.some(cat => 
          nombreCategoria.toLowerCase().includes(cat.toLowerCase()) || 
          cat.toLowerCase().includes(nombreCategoria.toLowerCase())
        );
        return coincide;
      });
    }
  }
}