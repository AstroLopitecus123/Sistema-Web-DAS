import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notificacion {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  duracion?: number; 
  icono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  private contadorId = 0;

  constructor() {}

  // Muestra una notificación de éxito
  mostrarExito(titulo: string, mensaje: string, duracion: number = 3000): string {
    return this.mostrar({
      id: this.generarId(),
      tipo: 'success',
      titulo,
      mensaje,
      duracion,
      icono: 'fas fa-check-circle'
    });
  }

  // Muestra una notificación de error
  mostrarError(titulo: string, mensaje: string, duracion: number = 5000): string {
    return this.mostrar({
      id: this.generarId(),
      tipo: 'error',
      titulo,
      mensaje,
      duracion,
      icono: 'fas fa-exclamation-circle'
    });
  }

  // Muestra una notificación de advertencia
  mostrarAdvertencia(titulo: string, mensaje: string, duracion: number = 4000): string {
    return this.mostrar({
      id: this.generarId(),
      tipo: 'warning',
      titulo,
      mensaje,
      duracion,
      icono: 'fas fa-exclamation-triangle'
    });
  }

  // Muestra una notificación informativa
  mostrarInfo(titulo: string, mensaje: string, duracion: number = 3000): string {
    return this.mostrar({
      id: this.generarId(),
      tipo: 'info',
      titulo,
      mensaje,
      duracion,
      icono: 'fas fa-info-circle'
    });
  }

  // Muestra una notificación personalizada
  mostrar(notificacion: Notificacion): string {
    const notificaciones = this.notificacionesSubject.value;
    
    // Verificar si ya existe una notificación similar (mismo tipo y mensaje)
    const existeSimilar = notificaciones.some(n => 
      n.tipo === notificacion.tipo && 
      n.titulo === notificacion.titulo && 
      n.mensaje === notificacion.mensaje
    );
    
    if (existeSimilar) {
      console.log('Notificación similar ya existe, omitiendo duplicado');
      return notificacion.id;
    }
    
    notificaciones.push(notificacion);
    this.notificacionesSubject.next([...notificaciones]);

    // Auto-ocultar si tiene duración
    if (notificacion.duracion && notificacion.duracion > 0) {
      setTimeout(() => {
        this.ocultar(notificacion.id);
      }, notificacion.duracion);
    }

    return notificacion.id;
  }

  // Oculta una notificación específica
  ocultar(id: string): void {
    const notificaciones = this.notificacionesSubject.value.filter(n => n.id !== id);
    this.notificacionesSubject.next(notificaciones);
  }

  // Oculta todas las notificaciones
  ocultarTodas(): void {
    this.notificacionesSubject.next([]);
  }

  // Obtiene las notificaciones actuales
  obtenerNotificaciones(): Notificacion[] {
    return this.notificacionesSubject.value;
  }

  private generarId(): string {
    return `notif_${++this.contadorId}_${Date.now()}`;
  }
}
