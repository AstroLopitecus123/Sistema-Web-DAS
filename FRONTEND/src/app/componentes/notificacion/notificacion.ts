import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NotificacionData {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
  duracion?: number;
}

@Component({
  selector: 'app-notificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion.html',
  styleUrls: ['./notificacion.css']
})
export class Notificacion implements OnInit, OnDestroy {
  @Input() notificacion: NotificacionData | null = null;
  @Input() mostrar: boolean = false;

  private timeoutId: any;

  ngOnInit(): void {
    if (this.notificacion && this.mostrar) {
      this.iniciarAutoCierre();
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private iniciarAutoCierre(): void {
    const duracion = this.notificacion?.duracion || 3000; // 3 segundos por defecto
    this.timeoutId = setTimeout(() => {
      this.cerrar();
    }, duracion);
  }

  cerrar(): void {
    this.mostrar = false;
    this.notificacion = null;
  }

  obtenerClaseTipo(): string {
    if (!this.notificacion) return '';
    
    switch (this.notificacion.tipo) {
      case 'exito':
        return 'notificacion-exito';
      case 'error':
        return 'notificacion-error';
      case 'advertencia':
        return 'notificacion-advertencia';
      case 'info':
        return 'notificacion-info';
      default:
        return 'notificacion-info';
    }
  }
}
