export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion: string;
}

export interface OpcionPersonalizacion {
  idOpcion: number;
  nombre: string;
  descripcion?: string;
  precioAdicional: number;
  activa: boolean;
  idProducto: number;
}

export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl?: string;
  categoria: string | Categoria;
  estado: 'activo' | 'inactivo';
  stock?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  ultimaActualizacion?: string;
  opcionesPersonalizacion?: OpcionPersonalizacion[];
}

export interface ItemCarrito {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string;
  stock: number;
  categoria: string;
  notasPersonalizacion?: string;
  opcionesSeleccionadas?: OpcionPersonalizacion[];
  precioOpciones?: number;
}