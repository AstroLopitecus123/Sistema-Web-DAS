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

  mostrar(notificacion: Notificacion): string {
    const notificaciones = this.notificacionesSubject.value;
    
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

    if (notificacion.duracion && notificacion.duracion > 0) {
      setTimeout(() => {
        this.ocultar(notificacion.id);
      }, notificacion.duracion);
    }

    return notificacion.id;
  }

  ocultar(id: string): void {
    const notificaciones = this.notificacionesSubject.value.filter(n => n.id !== id);
    this.notificacionesSubject.next(notificaciones);
  }

  ocultarTodas(): void {
    this.notificacionesSubject.next([]);
  }

  obtenerNotificaciones(): Notificacion[] {
    return this.notificacionesSubject.value;
  }

  private generarId(): string {
    return `notif_${++this.contadorId}_${Date.now()}`;
  }
}
