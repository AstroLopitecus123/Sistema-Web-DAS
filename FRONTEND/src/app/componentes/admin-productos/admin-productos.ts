import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto, Categoria } from '../../modelos/producto.model';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
  styleUrls: ['./admin-productos.css']
})
export class AdminProductos implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  terminoBusqueda = '';
  productoSeleccionado: Producto | null = null;
  modoEdicion = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    // Datos de ejemplo - en producción vendría del servicio
    this.productos = [
      {
        idProducto: 1,
        nombre: 'Hamburguesa Clásica',
        descripcion: 'Doble carne, queso cheddar y salsa especial.',
        precio: 15.00,
        stock: 45,
        categoria: { idCategoria: 1, nombreCategoria: 'Hamburguesas', descripcion: 'Platos principales' },
        imagenUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center',
        estado: 'activo',
        fechaCreacion: '2024-01-15T10:30:00Z',
        ultimaActualizacion: '2024-01-15T10:30:00Z'
      },
      {
        idProducto: 2,
        nombre: 'Papas Fritas',
        descripcion: 'Porción grande de papas crujientes y doradas.',
        precio: 5.50,
        stock: 30,
        categoria: { idCategoria: 2, nombreCategoria: 'Acompañamientos', descripcion: 'Complementos' },
        imagenUrl: 'https://aperitivo.cl/wp-content/uploads/2024/08/PAPA-PREFRITA-12mm-2.5-kg.jpg',
        estado: 'activo',
        fechaCreacion: '2024-01-15T10:30:00Z',
        ultimaActualizacion: '2024-01-15T10:30:00Z'
      }
    ];
  }

  cargarCategorias() {
    this.categorias = [
      { idCategoria: 1, nombreCategoria: 'Hamburguesas', descripcion: 'Platos principales' },
      { idCategoria: 2, nombreCategoria: 'Acompañamientos', descripcion: 'Complementos' },
      { idCategoria: 3, nombreCategoria: 'Bebidas', descripcion: 'Bebidas frías o calientes' },
      { idCategoria: 4, nombreCategoria: 'Postres', descripcion: 'Dulces y postres' }
    ];
  }

  buscarProductos() {
    if (this.terminoBusqueda.trim()) {
      this.productos = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (typeof p.categoria === 'string' ? p.categoria : p.categoria.nombreCategoria).toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    } else {
      this.cargarProductos();
    }
  }

  nuevoProducto() {
    this.productoSeleccionado = {
      idProducto: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: this.categorias[0],
      imagenUrl: '',
      estado: 'activo',
      fechaCreacion: '',
      ultimaActualizacion: ''
    };
    this.modoEdicion = true;
  }

  editarProducto(producto: Producto) {
    this.productoSeleccionado = { ...producto };
    this.modoEdicion = true;
  }

  guardarProducto() {
    if (this.productoSeleccionado) {
      if (this.productoSeleccionado.idProducto === 0) {
        // Nuevo producto
        this.productoSeleccionado.idProducto = this.productos.length + 1;
        this.productos.push(this.productoSeleccionado);
      } else {
        // Editar producto existente
        const index = this.productos.findIndex(p => p.idProducto === this.productoSeleccionado!.idProducto);
        if (index !== -1) {
          this.productos[index] = { ...this.productoSeleccionado };
        }
      }
      this.cancelarEdicion();
    }
  }

  cancelarEdicion() {
    this.productoSeleccionado = null;
    this.modoEdicion = false;
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.idProducto !== id);
    }
  }

  cambiarEstado(producto: Producto) {
    producto.estado = producto.estado === 'activo' ? 'inactivo' : 'activo';
  }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}

