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
    return this.items().reduce((sum, item) => {
      const precioOpciones = item.precioOpciones || 0;
      return sum + ((item.precio + precioOpciones) * item.cantidad);
    }, 0);
  });

  // Cargar todos los items del carrito
  getItems() {
    return this.items();
  }

  // Añadir un item al carrito
  agregarItem(nuevoItem: ItemCarrito): void {
    this.items.update(currentItems => {
      // Verificar si el producto ya existe en el carrito con las mismas opciones
      const itemExistente = currentItems.find(item => 
        item.idProducto === nuevoItem.idProducto && 
        this.tienenMismasOpciones(item.opcionesSeleccionadas, nuevoItem.opcionesSeleccionadas)
      );
      
      if (itemExistente) {
        // Si existe con las mismas opciones, incrementar la cantidad
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
        // Si no existe o tiene opciones diferentes, añadirlo como nuevo item
        const cantidadFinal = Math.min(nuevoItem.cantidad, 99);
        return [...currentItems, { ...nuevoItem, cantidad: cantidadFinal }];
      }
    });
  }

  // Helper para comparar opciones de personalización
  private tienenMismasOpciones(opciones1?: any[], opciones2?: any[]): boolean {
    if (!opciones1 && !opciones2) return true;
    if (!opciones1 || !opciones2) return false;
    if (opciones1.length !== opciones2.length) return false;
    
    return opciones1.every(opcion1 => 
      opciones2.some(opcion2 => opcion1.idOpcion === opcion2.idOpcion)
    );
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

