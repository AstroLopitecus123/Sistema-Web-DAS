import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalUbicacionService } from '../../servicios/modal-ubicacion.service';
import { OrigenUbicacion, UbicacionSeleccionada, UbicacionService } from '../../servicios/ubicacion.service';

@Component({
  selector: 'app-campo-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campo-ubicacion.html',
  styleUrls: ['./campo-ubicacion.css']
})
export class CampoUbicacion implements OnInit, OnDestroy {
  private ultimaActualizacion = 0;
  private actualizandoInternamente = false;
  private subscription?: Subscription;

  @Input() etiqueta: string = 'Dirección';
  @Input() placeholder: string = 'Ingresa la dirección completa';
  @Input() iconoEtiqueta: string = 'fas fa-map-marker-alt';
  @Input() nombreCampo: string = 'direccion';
  @Input() multilinea: boolean = false;
  @Input() filas: number = 3;
  @Input() requerido: boolean = false;
  @Input() deshabilitado: boolean = false;
  @Input() textoBoton: string = 'Seleccionar en mapa';
  @Input() mostrarOrigen: boolean = true;
  @Input() mostrarCoordenadas: boolean = true;

  @Input()
  set direccion(valor: string) {
    const nuevaDireccion = valor || '';
    this._direccion = nuevaDireccion;
  }
  get direccion(): string {
    return this._direccion;
  }
  private _direccion: string = '';

  @Output() direccionChange = new EventEmitter<string>();

  ubicacionSeleccionada: UbicacionSeleccionada | null = null;
  descripcionOrigenUbicacion: Record<OrigenUbicacion, string> = {
    gps: 'Detectada por GPS',
    ip: 'Detectada automáticamente',
    autocomplete: 'Seleccionada en el mapa',
    manual: 'Ingresada manualmente'
  };

  constructor(
    private ubicacionService: UbicacionService,
    private modalUbicacionService: ModalUbicacionService
  ) {}

  ngOnInit(): void {
    const ubicacionInicial = this.ubicacionService.obtenerUbicacionActual();
    if (ubicacionInicial) {
      this.aplicarUbicacion(ubicacionInicial, true);
    } else if (this.direccion && this.direccion.trim().length > 0) {
      this.ultimaActualizacion = Date.now();
      this.ubicacionSeleccionada = {
        direccion: this.direccion,
        latitud: null,
        longitud: null,
        origen: 'manual',
        timestamp: this.ultimaActualizacion
      };
    }

    this.subscription = this.ubicacionService.obtenerUbicacion().subscribe((ubicacion) => {
      if (ubicacion) {
        this.aplicarUbicacion(ubicacion);
      } else {
        this.ubicacionSeleccionada = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  abrirSelectorUbicacion(): void {
    if (!this.deshabilitado) {
      this.modalUbicacionService.abrir();
    }
  }

  onDireccionManualChange(valor: string): void {
    this.ultimaActualizacion = Date.now();
    this.actualizandoInternamente = true;
    this._direccion = valor;

    if (!valor || valor.trim().length === 0) {
      this.ubicacionSeleccionada = null;
      this.ubicacionService.limpiarUbicacion();
      Promise.resolve().then(() => {
        this.direccionChange.emit('');
        this.actualizandoInternamente = false;
      });
      return;
    }

    const ubicacion: UbicacionSeleccionada = {
      direccion: valor,
      latitud: this.ubicacionSeleccionada?.latitud ?? null,
      longitud: this.ubicacionSeleccionada?.longitud ?? null,
      origen: 'manual',
      timestamp: this.ultimaActualizacion
    };

    this.ubicacionSeleccionada = ubicacion;
    this.ubicacionService.establecerUbicacion(ubicacion);
    Promise.resolve().then(() => {
      this.direccionChange.emit(valor);
      this.actualizandoInternamente = false;
    });
  }

  private aplicarUbicacion(ubicacion: UbicacionSeleccionada, forzar: boolean = false): void {
    this.ubicacionSeleccionada = ubicacion;

    if (
      forzar ||
      !this.direccion.trim() ||
      ubicacion.timestamp >= this.ultimaActualizacion
    ) {
      this.actualizandoInternamente = true;
      this.ultimaActualizacion = ubicacion.timestamp;
      this._direccion = ubicacion.direccion;
      Promise.resolve().then(() => {
        this.direccionChange.emit(ubicacion.direccion);
        this.actualizandoInternamente = false;
      });
    }
  }
}

