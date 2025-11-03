import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalUbicacionService {
  private estadoSubject = new BehaviorSubject<boolean>(false);

  abrir(): void {
    this.estadoSubject.next(true);
  }

  cerrar(): void {
    this.estadoSubject.next(false);
  }

  estado$(): Observable<boolean> {
    return this.estadoSubject.asObservable();
  }

  estaAbierto(): boolean {
    return this.estadoSubject.value;
  }
}
