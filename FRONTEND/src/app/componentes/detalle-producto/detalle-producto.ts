import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../modelos/producto.model';

export interface ItemCarrito {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl?: string;
  cantidad: number;
  notasPersonalizacion?: string;
}

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
  personalizacion: string = '';

  ngOnInit(): void {
    if (this.producto) {
      this.cantidad = 1;
      this.personalizacion = '';
    }
  }

  ngOnChanges(): void {
    if (this.producto) {
      this.cantidad = 1;
      this.personalizacion = '';
    }
  }

  incrementarCantidad(): void {
    // Permitir incrementar hasta 99 o hasta el stock si está disponible
    const maxCantidad = this.producto?.stock ? Math.min(99, this.producto.stock) : 99;
    
    if (this.cantidad < maxCantidad) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
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
  }

  confirmarAgregar(): void {
    if (this.producto) {
      const item: ItemCarrito = {
        idProducto: this.producto.idProducto,
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        precio: this.producto.precio,
        stock: this.producto.stock || 0,
        categoria: this.obtenerNombreCategoria(this.producto.categoria),
        imagenUrl: this.producto.imagenUrl,
        cantidad: this.cantidad,
        notasPersonalizacion: this.personalizacion.trim() || undefined
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
