import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito } from '../modelos/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Usando signals para el estado reactivo del carrito
  private items = signal<ItemCarrito[]>([]);

  // Computed signals para cálculos automáticos
  totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.cantidad, 0);
  });

  subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  });

  // Cargar todos los items del carrito
  getItems() {
    return this.items();
  }

  // Añadir un item al carrito
  agregarItem(nuevoItem: ItemCarrito): void {
    this.items.update(currentItems => {
      // Verificar si el producto ya existe en el carrito
      const itemExistente = currentItems.find(item => item.idProducto === nuevoItem.idProducto);
      
      if (itemExistente) {
        // Si existe, incrementar la cantidad (con validación de máximo 99)
        const nuevaCantidad = itemExistente.cantidad + nuevoItem.cantidad;
        const cantidadFinal = Math.min(nuevaCantidad, 99); 
        
        if (cantidadFinal < nuevaCantidad) {
          console.warn('No se puede agregar más de 99 unidades del mismo producto');
        }
        
        return currentItems.map(item => 
          item.idProducto === nuevoItem.idProducto 
            ? { ...item, cantidad: cantidadFinal }
            : item
        );
      } else {
        // Si no existe, añadirlo al carrito (con validación de máximo 99)
        const cantidadFinal = Math.min(nuevoItem.cantidad, 99);
        return [...currentItems, { ...nuevoItem, cantidad: cantidadFinal }];
      }
    });
  }

  // Modificar cantidad de un item
  actualizarCantidad(idProducto: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarItem(idProducto);
      return;
    }

    // Validar que no exceda el máximo de 99 unidades
    const cantidadFinal = Math.min(nuevaCantidad, 99);
    
    if (cantidadFinal < nuevaCantidad) {
      console.warn('No se puede agregar más de 99 unidades del mismo producto');
    }

    this.items.update(currentItems =>
      currentItems.map(item =>
        item.idProducto === idProducto
          ? { ...item, cantidad: cantidadFinal }
          : item
      )
    );
  }

  // Eliminar un item del carrito
  eliminarItem(idProducto: number): void {
    this.items.update(currentItems =>
      currentItems.filter(item => item.idProducto !== idProducto)
    );
  }

  // Vaciar todo el carrito
  vaciarCarrito(): void {
    this.items.set([]);
  }

  // Consultar cantidad de un producto específico
  getCantidadProducto(idProducto: number): number {
    const item = this.items().find(item => item.idProducto === idProducto);
    return item ? item.cantidad : 0;
  }

  // Actualizar personalización de un item
  actualizarPersonalizacion(idProducto: number, notasPersonalizacion: string): void {
    this.items.update(currentItems =>
      currentItems.map(item =>
        item.idProducto === idProducto
          ? { ...item, notasPersonalizacion }
          : item
      )
    );
  }
}

