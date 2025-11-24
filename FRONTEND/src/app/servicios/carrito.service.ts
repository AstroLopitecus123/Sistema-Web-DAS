import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito } from '../modelos/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items = signal<ItemCarrito[]>([]);

  totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.cantidad, 0);
  });

  subtotal = computed(() => {
    return this.items().reduce((sum, item) => {
      const precioOpciones = item.precioOpciones || 0;
      return sum + ((item.precio + precioOpciones) * item.cantidad);
    }, 0);
  });

  getItems() {
    return this.items();
  }

  agregarItem(nuevoItem: ItemCarrito): void {
    this.items.update(currentItems => {
      const itemExistente = currentItems.find(item => 
        item.idProducto === nuevoItem.idProducto && 
        this.tienenMismasOpciones(item.opcionesSeleccionadas, nuevoItem.opcionesSeleccionadas)
      );
      
      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + nuevoItem.cantidad;
        const cantidadFinal = Math.min(nuevaCantidad, 99); 
        
        if (cantidadFinal < nuevaCantidad) {
          console.warn('No se puede agregar más de 99 unidades del mismo producto');
        }
        
        return currentItems.map(item => 
          item.idProducto === nuevoItem.idProducto && 
          this.tienenMismasOpciones(item.opcionesSeleccionadas, nuevoItem.opcionesSeleccionadas)
            ? { ...item, cantidad: cantidadFinal }
            : item
        );
      } else {
        const cantidadFinal = Math.min(nuevoItem.cantidad, 99);
        return [...currentItems, { ...nuevoItem, cantidad: cantidadFinal }];
      }
    });
  }

  private tienenMismasOpciones(opciones1?: any[], opciones2?: any[]): boolean {
    if (!opciones1 && !opciones2) return true;
    if (!opciones1 || !opciones2) return false;
    if (opciones1.length !== opciones2.length) return false;
    
    return opciones1.every(opcion1 => 
      opciones2.some(opcion2 => opcion1.idOpcion === opcion2.idOpcion)
    );
  }

  actualizarCantidad(idProducto: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarItem(idProducto);
      return;
    }

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

  eliminarItem(idProducto: number): void {
    this.items.update(currentItems =>
      currentItems.filter(item => item.idProducto !== idProducto)
    );
  }

  vaciarCarrito(): void {
    this.items.set([]);
  }

  getCantidadProducto(idProducto: number): number {
    const item = this.items().find(item => item.idProducto === idProducto);
    return item ? item.cantidad : 0;
  }

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

