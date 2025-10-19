export interface PaymentRequest {
  idUsuario: number;
  productos: Array<{
    idProducto: number;
    cantidad: number;
  }>;
  direccionEntrega: string;
  metodoPago: string;
  notasCliente?: string;
}

export interface PaymentResponse {
  clientSecret: string;
  idPedido: number;
  totalPedido: number;
}

export interface InformacionPago {
  metodoPago: 'tarjeta' | 'billetera_virtual' | 'efectivo';
  nombreTarjeta?: string;
  numeroTarjeta?: string;
  fechaExpiracion?: string;
  cvv?: string;
  direccionFacturacion?: string;
  codigoBilletera?: string;
  notasCliente?: string;
}
