import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type OrigenUbicacion = 'manual' | 'autocomplete' | 'gps' | 'ip';

export interface UbicacionSeleccionada {
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  origen: OrigenUbicacion;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly STORAGE_KEY = 'ubicacion-seleccionada';
  private readonly ubicacionSubject: BehaviorSubject<UbicacionSeleccionada | null>;

  constructor() {
    const ubicacionInicial = this.obtenerDesdeStorage();
    this.ubicacionSubject = new BehaviorSubject<UbicacionSeleccionada | null>(ubicacionInicial);
  }

  obtenerUbicacion(): Observable<UbicacionSeleccionada | null> {
    return this.ubicacionSubject.asObservable();
  }

  obtenerUbicacionActual(): UbicacionSeleccionada | null {
    return this.ubicacionSubject.value;
  }

  establecerUbicacion(ubicacion: UbicacionSeleccionada): void {
    this.ubicacionSubject.next(ubicacion);
    this.guardarEnStorage(ubicacion);
  }

  limpiarUbicacion(): void {
    this.ubicacionSubject.next(null);
    this.eliminarDeStorage();
  }

  private obtenerDesdeStorage(): UbicacionSeleccionada | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const data = window.localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.direccion === 'string') {
        return {
          direccion: parsed.direccion,
          latitud: typeof parsed.latitud === 'number' ? parsed.latitud : null,
          longitud: typeof parsed.longitud === 'number' ? parsed.longitud : null,
          origen: parsed.origen as OrigenUbicacion || 'manual',
          timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now()
        };
      }
      return null;
    } catch (error) {
      console.warn('No se pudo parsear la ubicación almacenada:', error);
      return null;
    }
  }

  private guardarEnStorage(ubicacion: UbicacionSeleccionada): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ubicacion));
    } catch (error) {
      console.warn('No se pudo guardar la ubicación seleccionada:', error);
    }
  }

  private eliminarDeStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('No se pudo eliminar la ubicación almacenada:', error);
    }
  }
}
