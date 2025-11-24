import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto.model';

export interface FiltrosProductos {
  keyword: string;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiltrosProductosService {

  filtrarProductos(productos: Producto[], filtros: FiltrosProductos): Producto[] {
    let productosFiltrados = [...productos];

    if (filtros.keyword && filtros.keyword.trim()) {
      productosFiltrados = this.filtrarPorPalabraClave(productosFiltrados, filtros.keyword);
    }

    if (filtros.categoria && filtros.categoria !== 'todos') {
      productosFiltrados = this.filtrarPorCategoria(productosFiltrados, filtros.categoria);
    }

    return productosFiltrados;
  }

  private filtrarPorPalabraClave(productos: Producto[], keyword: string): Producto[] {
    const palabraClave = keyword.toLowerCase().trim();
    
    return productos.filter(producto => 
      producto.nombre.toLowerCase().includes(palabraClave) ||
      producto.descripcion.toLowerCase().includes(palabraClave) ||
      (typeof producto.categoria === 'string' ? 
        producto.categoria.toLowerCase().includes(palabraClave) :
        producto.categoria.nombreCategoria.toLowerCase().includes(palabraClave))
    );
  }

  private filtrarPorCategoria(productos: Producto[], categoria: string): Producto[] {
    return productos.filter(producto => 
      (typeof producto.categoria === 'string' ? 
        producto.categoria.toLowerCase() === categoria.toLowerCase() :
        producto.categoria.nombreCategoria.toLowerCase() === categoria.toLowerCase())
    );
  }

  obtenerCategorias(productos: Producto[]): string[] {
    const categorias = productos.map(producto => 
      typeof producto.categoria === 'string' ? 
        producto.categoria : 
        producto.categoria.nombreCategoria
    );
    return [...new Set(categorias)].sort();
  }

  obtenerOpcionesFiltro(productos: Producto[]): {
    categorias: { valor: string; etiqueta: string }[];
  } {
    const categoriasUnicas = this.obtenerCategorias(productos);
    
    return {
      categorias: [
        { valor: 'todos', etiqueta: 'Todas las categorías' },
        ...categoriasUnicas.map(categoria => ({
          valor: categoria.toLowerCase(),
          etiqueta: categoria
        }))
      ]
    };
  }

  limpiarFiltros(): FiltrosProductos {
    return {
      keyword: '',
      categoria: 'todos'
    };
  }

  tieneFiltrosActivos(filtros: FiltrosProductos): boolean {
    return (!!filtros.keyword && filtros.keyword.trim() !== '') || 
           (!!filtros.categoria && filtros.categoria !== 'todos');
  }
}
