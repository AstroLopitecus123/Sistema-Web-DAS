export interface Pedido {
  idPedido: number;
  fechaPedido: string;
  estadoPedido: string;
  totalPedido: number;
  direccionEntrega: string;
  notasCliente?: string;
  metodoPago: string;
  estadoPago: string;
  fechaEntrega?: string;
  productos?: ProductoDetalle[];
  cliente?: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    telefono: string;
  };
  repartidor?: {
    idRepartidor?: number;
    nombre: string;
    apellido: string;
    telefono: string;
  };
}

export interface DetallePedido {
  idDetallePedido: number;
  idPedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notasPersonalizacion?: string;
  producto?: {
    idProducto: number;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
  };
}

export interface ProductoDetalle {
  idDetallePedido: number;
  idProducto: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notasPersonalizacion?: string;
  imagenUrl?: string;
  categoria: string;
}

export interface CrearPedidoRequest {
  idUsuario: number;
  productos: Array<{
    idProducto: number;
    cantidad: number;
  }>;
  metodoPago: string;
  direccionEntrega: string;
  notasCliente?: string;
}

export interface PedidoResponse {
  idPedido: number;
  mensaje: string;
  totalPedido: number;
  estadoPedido: string;
}