import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService, Notificacion } from '../../servicios/notificacion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.subscription = this.notificacionService.notificaciones$.subscribe(
      notificaciones => {
        this.notificaciones = notificaciones;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cerrarNotificacion(id: string): void {
    this.notificacionService.ocultar(id);
  }

  obtenerClaseNotificacion(notificacion: Notificacion): string {
    return `notification notification-${notificacion.tipo}`;
  }
}
