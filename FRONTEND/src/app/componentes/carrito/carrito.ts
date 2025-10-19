import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { ItemCarrito } from '../detalle-producto/detalle-producto';
import { Checkout } from '../checkout/checkout';
import { NotificacionService } from '../../servicios/notificacion.service';

interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string;
}

interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: Categoria;
  imagenUrl?: string;
  estado: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

// Definimos una interfaz para los ítems dentro del carrito, extendiendo Producto
interface CarritoItem extends Producto {
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe, Checkout],
  templateUrl: './carrito.html', 
  styleUrls: ['./carrito.css'] 
})
export class Carrito implements OnInit {

  // Usar el servicio de carrito
  get items() {
    return this.carritoService.getItems();
  }
  
  get subtotal() {
    return this.carritoService.subtotal();
  }
  
  get totalItems() {
    return this.carritoService.totalItems();
  }

  mostrarCheckout = false;

  constructor(
    private router: Router,
    private carritoService: CarritoService,
    private notificacionService: NotificacionService
  ) { }

  ngOnInit(): void {
    // Ya no necesitamos cargar items simulados, el servicio maneja el estado
  }

  /**
   * Se ejecuta cada vez que el usuario cambia la cantidad o usa los botones +/-.
   * @param item El item a actualizar.
   */
  actualizarCantidad(item: ItemCarrito): void {
    // Validar que no exceda el máximo de 99 unidades
    if (item.cantidad > 99) {
      item.cantidad = 99;
      this.notificacionService.mostrarAdvertencia(
        'Límite alcanzado', 
        'No se puede agregar más de 99 unidades del mismo producto'
      );
    }
    
    // Validar que no sea menor a 0
    if (item.cantidad < 0) {
      item.cantidad = 0;
    }
    
    this.carritoService.actualizarCantidad(item.idProducto, item.cantidad);
  }

  /**
   * Cambia la cantidad del producto y actualiza el subtotal.
   * @param item El item a modificar.
   * @param delta +1 para incrementar, -1 para decrementar.
   */
  cambiarCantidad(item: ItemCarrito, delta: number): void {
    const nuevaCantidad = item.cantidad + delta;
    
    // Validar que no exceda el máximo de 99 unidades
    if (nuevaCantidad > 99) {
      this.notificacionService.mostrarAdvertencia(
        'Límite alcanzado', 
        'No se puede agregar más de 99 unidades del mismo producto'
      );
      return;
    }
    
    // Validar que no sea menor a 0
    if (nuevaCantidad < 0) {
      return;
    }
    
    this.carritoService.actualizarCantidad(item.idProducto, nuevaCantidad);
  }

  /**
   * Elimina un ítem del carrito.
   * @param idProducto ID del producto a eliminar.
   */
  removeItem(idProducto: number): void {
    this.carritoService.eliminarItem(idProducto);
    this.notificacionService.mostrarInfo(
      'Producto eliminado', 
      'El producto ha sido removido del carrito'
    );
  }

  /**
   * Vacía todo el carrito.
   */
  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
    this.notificacionService.mostrarInfo(
      'Carrito vaciado', 
      'Todos los productos han sido removidos del carrito'
    );
  }

  /**
   * Abre el modal de checkout para procesar el pago
   */
  finalizarCompra(): void {
    if (this.subtotal > 0) {
      this.mostrarCheckout = true;
    } else {
      this.notificacionService.mostrarAdvertencia(
        'Carrito vacío', 
        'No puedes finalizar la compra si el carrito está vacío'
      );
    }
  }

  /**
   * Cierra el modal de checkout
   */
  cerrarCheckout(): void {
    this.mostrarCheckout = false;
  }

  /**
   * Maneja el pago exitoso
   */
  onPagoExitoso(): void {
    this.mostrarCheckout = false;
    // La notificación de éxito se maneja en el componente checkout
    // Opcional: redirigir a una página de confirmación
    // this.router.navigate(['/confirmacion-pedido']);
  }

  /**
   * Simula la navegación de vuelta al menú (simulación de router.navigate)
   */
  simularNavegacion(ruta: string): void {
    console.log(`Navegando a ${ruta}`);
    // Aquí iría la lógica real de this.router.navigate([ruta])
  }

cerrarCarrito(): void {
  this.router.navigate(['/menu']);   // Navega directamente a la ruta /menu
}
}