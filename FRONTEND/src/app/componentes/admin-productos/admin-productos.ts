import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto, Categoria } from '../../modelos/producto.model';
import { MenuService } from '../../servicios/menu.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
  styleUrls: ['./admin-productos.css']
})
export class AdminProductos implements OnInit {
  productos: Producto[] = [];
  productosOriginales: Producto[] = []; // Copia de todos los productos para búsqueda
  categorias: Categoria[] = [];
  terminoBusqueda = '';
  productoSeleccionado: Producto | null = null;
  modoEdicion = false;
  cargandoProductos = false;
  errorProductos: string | null = null;

  constructor(
    private router: Router,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargandoProductos = true;
    this.errorProductos = null;
    
    this.menuService.obtenerProductosAdmin().subscribe({
      next: (productos) => {
        this.productosOriginales = productos || [];
        this.productos = [...this.productosOriginales];
        this.cargarCategorias();
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.errorProductos = 'No se pudieron cargar los productos';
        this.productos = [];
        this.productosOriginales = [];
        this.cargandoProductos = false;
      }
    });
  }

  cargarCategorias() {
    const categoriasMap = new Map<number, Categoria>();
    
    this.productos.forEach(producto => {
      if (producto.categoria) {
        let categoria: Categoria;
        
        if (typeof producto.categoria === 'string') {
          const idCategoria = (producto as any).categoriaId || 0;
          categoria = {
            idCategoria: idCategoria,
            nombreCategoria: producto.categoria,
            descripcion: ''
          };
        } else {
          categoria = producto.categoria;
        }
        
        if (!categoriasMap.has(categoria.idCategoria)) {
          categoriasMap.set(categoria.idCategoria, categoria);
        }
      }
    });
    
    this.categorias = Array.from(categoriasMap.values());
  }

  buscarProductos() {
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      this.productos = this.productosOriginales.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        (typeof p.categoria === 'string' ? p.categoria : p.categoria.nombreCategoria).toLowerCase().includes(termino)
      );
    } else {
      this.productos = [...this.productosOriginales];
    }
  }

  nuevoProducto() {
    this.productoSeleccionado = {
      idProducto: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: this.categorias.length > 0 ? this.categorias[0] : { idCategoria: 0, nombreCategoria: '', descripcion: '' },
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
    if (!this.productoSeleccionado) {
      return;
    }

    const categoriaId = typeof this.productoSeleccionado.categoria === 'object' && this.productoSeleccionado.categoria
      ? this.productoSeleccionado.categoria.idCategoria
      : (this.productoSeleccionado as any).categoriaId || 0;

    const request = {
      idProducto: this.productoSeleccionado.idProducto === 0 ? undefined : this.productoSeleccionado.idProducto,
      nombre: this.productoSeleccionado.nombre,
      descripcion: this.productoSeleccionado.descripcion || '',
      precio: this.productoSeleccionado.precio,
      idCategoria: categoriaId,
      imagenUrl: this.productoSeleccionado.imagenUrl || '',
      estado: this.productoSeleccionado.estado || 'activo',
      stock: this.productoSeleccionado.stock || 0
    };

    this.menuService.guardarProducto(request).subscribe({
      next: (productoGuardado) => {
        this.cargarProductos();
        this.cancelarEdicion();
      },
      error: (error) => {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar el producto. Por favor, intenta nuevamente.');
      }
    });
  }

  cancelarEdicion() {
    this.productoSeleccionado = null;
    this.modoEdicion = false;
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.menuService.eliminarProducto(id).subscribe({
        next: (response) => {
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  cambiarEstado(producto: Producto) {
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';
    const categoriaId = typeof producto.categoria === 'object' && producto.categoria
      ? producto.categoria.idCategoria
      : (producto as any).categoriaId || 0;

    const request = {
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      idCategoria: categoriaId,
      imagenUrl: producto.imagenUrl || '',
      estado: nuevoEstado,
      stock: producto.stock || 0
    };

    this.menuService.guardarProducto(request).subscribe({
      next: () => {
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al cambiar estado del producto:', error);
        alert('Error al cambiar el estado del producto. Por favor, intenta nuevamente.');
        producto.estado = producto.estado === 'activo' ? 'inactivo' : 'activo';
      }
    });
  }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}

