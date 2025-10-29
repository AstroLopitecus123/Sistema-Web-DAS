import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto, OpcionPersonalizacion, ItemCarrito } from '../../modelos/producto.model';
import { PersonalizacionService } from '../../servicios/personalizacion.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-producto.html',
  styleUrls: ['./detalle-producto.css']
})
export class DetalleProducto implements OnInit, OnChanges {
  @Input() producto: Producto | null = null;
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() agregarAlCarrito = new EventEmitter<ItemCarrito>();

  cantidad: number = 1;
  opcionesDisponibles: OpcionPersonalizacion[] = [];
  opcionesSeleccionadas: OpcionPersonalizacion[] = [];
  precioOpciones: number = 0;
  precioTotal: number = 0;
  cargandoOpciones: boolean = false;

  constructor(private personalizacionService: PersonalizacionService) {}

  ngOnInit(): void {
    if (this.producto) {
      this.cantidad = 1;
      this.cargarOpcionesPersonalizacion();
    }
  }

  ngOnChanges(): void {
    if (this.producto) {
      this.cantidad = 1;
      this.opcionesSeleccionadas = [];
      this.precioOpciones = 0;
      this.cargarOpcionesPersonalizacion();
    }
  }

  incrementarCantidad(): void {
    // Permitir incrementar hasta 99 o hasta el stock si está disponible
    const maxCantidad = this.producto?.stock ? Math.min(99, this.producto.stock) : 99;
    
    if (this.cantidad < maxCantidad) {
      this.cantidad++;
      this.calcularPrecioTotal();
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
      this.calcularPrecioTotal();
    }
  }

  onCantidadChange(): void {
    if (this.cantidad < 1) {
      this.cantidad = 1;
    }
    // Limitar a 99 o al stock disponible
    const maxCantidad = this.producto?.stock ? Math.min(99, this.producto.stock) : 99;
    if (this.cantidad > maxCantidad) {
      this.cantidad = maxCantidad;
    }
    this.calcularPrecioTotal();
  }

  cargarOpcionesPersonalizacion(): void {
    if (!this.producto) return;

    this.cargandoOpciones = true;
    this.personalizacionService.obtenerOpcionesPersonalizacion(this.producto.idProducto)
      .subscribe({
        next: (opciones) => {
          this.opcionesDisponibles = opciones.filter(opcion => opcion.activa);
          this.cargandoOpciones = false;
          this.calcularPrecioTotal();
        },
        error: (error) => {
          console.error('Error al cargar opciones de personalización:', error);
          this.opcionesDisponibles = [];
          this.cargandoOpciones = false;
        }
      });
  }

  toggleOpcion(opcion: OpcionPersonalizacion): void {
    const index = this.opcionesSeleccionadas.findIndex(o => o.idOpcion === opcion.idOpcion);
    
    if (index > -1) {
      // Remover opción si ya está seleccionada
      this.opcionesSeleccionadas.splice(index, 1);
    } else {
      // Agregar opción si no está seleccionada
      this.opcionesSeleccionadas.push(opcion);
    }
    
    this.calcularPrecioTotal();
  }

  isOpcionSeleccionada(opcion: OpcionPersonalizacion): boolean {
    return this.opcionesSeleccionadas.some(o => o.idOpcion === opcion.idOpcion);
  }

  calcularPrecioTotal(): void {
    if (!this.producto) return;

    this.precioOpciones = this.personalizacionService.calcularPrecioOpciones(this.opcionesSeleccionadas);
    this.precioTotal = (this.producto.precio + this.precioOpciones) * this.cantidad;
  }

  confirmarAgregar(): void {
    if (this.producto) {
      const personalizacionTexto = this.personalizacionService.formatearOpcionesSeleccionadas(this.opcionesSeleccionadas);
      
      const item: ItemCarrito = {
        idProducto: this.producto.idProducto,
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        precio: this.producto.precio,
        stock: this.producto.stock || 0,
        categoria: this.obtenerNombreCategoria(this.producto.categoria),
        imagenUrl: this.producto.imagenUrl,
        cantidad: this.cantidad,
        notasPersonalizacion: personalizacionTexto || undefined,
        opcionesSeleccionadas: this.opcionesSeleccionadas.length > 0 ? [...this.opcionesSeleccionadas] : undefined,
        precioOpciones: this.precioOpciones
      };
      
      this.agregarAlCarrito.emit(item);
      this.cerrarModal();
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
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
}
