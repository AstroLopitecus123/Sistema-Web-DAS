import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { ItemCarrito } from '../../modelos/producto.model';
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
  }

  actualizarCantidad(item: ItemCarrito): void {
    if (item.cantidad > 99) {
      item.cantidad = 99;
      this.notificacionService.mostrarAdvertencia(
        'Límite alcanzado', 
        'No se puede agregar más de 99 unidades del mismo producto'
      );
    }
    
    if (item.cantidad < 0) {
      item.cantidad = 0;
    }
    
    this.carritoService.actualizarCantidad(item.idProducto, item.cantidad);
  }

  cambiarCantidad(item: ItemCarrito, delta: number): void {
    const nuevaCantidad = item.cantidad + delta;
    
    if (nuevaCantidad > 99) {
      this.notificacionService.mostrarAdvertencia(
        'Límite alcanzado', 
        'No se puede agregar más de 99 unidades del mismo producto'
      );
      return;
    }
    
    if (nuevaCantidad < 0) {
      return;
    }
    
    this.carritoService.actualizarCantidad(item.idProducto, nuevaCantidad);
  }

  removeItem(idProducto: number): void {
    this.carritoService.eliminarItem(idProducto);
    this.notificacionService.mostrarInfo(
      'Producto eliminado', 
      'El producto ha sido removido del carrito'
    );
  }

  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
    this.notificacionService.mostrarInfo(
      'Carrito vaciado', 
      'Todos los productos han sido removidos del carrito'
    );
  }

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

  cerrarCheckout(): void {
    this.mostrarCheckout = false;
  }

  onPagoExitoso(): void {
    this.mostrarCheckout = false;
  }

  simularNavegacion(ruta: string): void {

  }

cerrarCarrito(): void {
  this.router.navigate(['/menu']);
}
}