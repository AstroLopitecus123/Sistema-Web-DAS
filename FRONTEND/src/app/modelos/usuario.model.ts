export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol: 'cliente' | 'administrador' | 'repartidor' | 'vendedor';
  activo: boolean;
  fechaRegistro?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    direccion?: string;
    rol: string;
  };
}

export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  contrasena: string;
}
