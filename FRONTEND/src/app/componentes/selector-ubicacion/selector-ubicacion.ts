import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UbicacionService, UbicacionSeleccionada, OrigenUbicacion } from '../../servicios/ubicacion.service';

declare const google: any;

@Component({
  selector: 'app-selector-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-ubicacion.html',
  styleUrls: ['./selector-ubicacion.css']
})
export class SelectorUbicacionComponent implements OnInit, AfterViewInit {
  @Input() mostrarTitulo = true;
  @Input() mostrarCerrar = true;
  @Output() cerrar = new EventEmitter<void>();

  direccionSeleccionada = '';
  ubicacionError: string | null = null;
  ubicacionActual: UbicacionSeleccionada | null = null;
  ubicacionDetectada = false;

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('autocompleteInput') private autocompleteInput?: ElementRef<HTMLInputElement>;

  private map: any;
  private marker: any;
  private autocomplete: any;
  private geocoder: any;
  private readonly centroPorDefecto = { lat: -12.046373, lng: -77.042754 };
  private ubicacionPendienteRestaurar: UbicacionSeleccionada | null = null;

  constructor(
    private ubicacionService: UbicacionService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const ubicacionGuardada = this.ubicacionService.obtenerUbicacionActual();
    if (ubicacionGuardada) {
      this.ubicacionPendienteRestaurar = ubicacionGuardada;
      this.ubicacionActual = ubicacionGuardada;
      this.direccionSeleccionada = ubicacionGuardada.direccion;
      this.ubicacionDetectada = true;
    }
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  usarUbicacionActual(): void {
    this.ubicacionError = null;

    if (typeof navigator === 'undefined' || (!navigator.geolocation && !window.fetch)) {
      this.ubicacionError = 'Tu dispositivo no permite obtener tu ubicación automáticamente.';
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          this.establecerUbicacion(location, undefined, 'gps', false);
          this.obtenerDireccionDesdeCoordenadas(location, 'gps');
        },
        (error) => {
          this.ngZone.run(() => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                this.ubicacionError = 'No pudimos acceder a tu ubicación. Permite el acceso o ingresa la dirección manualmente.';
                break;
              case error.POSITION_UNAVAILABLE:
                this.ubicacionError = 'No se pudo obtener tu ubicación actual. Intentaremos aproximarla.';
                break;
              case error.TIMEOUT:
                this.ubicacionError = 'La solicitud de ubicación tardó demasiado. Intentaremos aproximarla.';
                break;
              default:
                this.ubicacionError = 'Ocurrió un error al obtener tu ubicación.';
            }
          });
          this.obtenerUbicacionPorIpFallback();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      this.obtenerUbicacionPorIpFallback();
    }
  }

  private obtenerUbicacionPorIpFallback(): void {
    this.obtenerUbicacionPorIp()
      .then((coords) => {
        this.ngZone.run(() => {
          const location = new google.maps.LatLng(coords.lat, coords.lng);
          this.establecerUbicacion(location, undefined, 'ip', false);
          this.obtenerDireccionDesdeCoordenadas(location, 'ip');
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          if (!this.ubicacionError) {
            this.ubicacionError = 'No se pudo determinar tu ubicación automáticamente. Ingresa la dirección manualmente.';
          }
        });
      });
  }

  private inicializarMapa(reintentos = 0): void {
    if (!this.mapContainer || !this.autocompleteInput) {
      return;
    }

    const mapaDisponible = typeof google !== 'undefined' && google.maps && google.maps.places;

    if (!mapaDisponible) {
      if (reintentos < 20) {
        setTimeout(() => this.inicializarMapa(reintentos + 1), 300);
      } else {
        console.warn('Google Maps no se cargó correctamente.');
      }
      return;
    }

    const centro = new google.maps.LatLng(this.centroPorDefecto.lat, this.centroPorDefecto.lng);
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: centro,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.marker = new google.maps.Marker({
      position: centro,
      map: this.map,
      draggable: true
    });

    // Inicializa geocoder solo si Google Maps está disponible
    try {
      this.geocoder = new google.maps.Geocoder();
    } catch (error) {
      console.warn('Geocoder de Google Maps no disponible, se usará servicio alternativo');
      this.geocoder = null;
    }

    this.autocomplete = new google.maps.places.Autocomplete(this.autocompleteInput.nativeElement, {
      fields: ['geometry', 'formatted_address', 'name'],
      types: ['address']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      if (!place || !place.geometry || !place.geometry.location) {
        return;
      }

      const direccion = place.formatted_address || place.name || '';
      this.establecerUbicacion(place.geometry.location, direccion, 'autocomplete');
    });

    this.registrarEventosMapa();

    if (this.ubicacionPendienteRestaurar) {
      const coords = this.ubicacionPendienteRestaurar.latitud !== null && this.ubicacionPendienteRestaurar.longitud !== null
        ? (typeof google !== 'undefined' && google.maps 
            ? new google.maps.LatLng(this.ubicacionPendienteRestaurar.latitud, this.ubicacionPendienteRestaurar.longitud)
            : { lat: this.ubicacionPendienteRestaurar.latitud, lng: this.ubicacionPendienteRestaurar.longitud })
        : (typeof google !== 'undefined' && google.maps
            ? new google.maps.LatLng(this.centroPorDefecto.lat, this.centroPorDefecto.lng)
            : this.centroPorDefecto);

      // Si no hay dirección guardada o está en formato de coordenadas, intenta obtenerla
      if (!this.ubicacionPendienteRestaurar.direccion || 
          this.ubicacionPendienteRestaurar.direccion.startsWith('Coordenadas:')) {
        this.obtenerDireccionDesdeCoordenadas(coords, this.ubicacionPendienteRestaurar.origen);
      } else {
        this.establecerUbicacion(
          coords,
          this.ubicacionPendienteRestaurar.direccion,
          this.ubicacionPendienteRestaurar.origen,
          false
        );
      }
      this.ubicacionPendienteRestaurar = null;
    }
  }

  private establecerUbicacion(location: any, direccion?: string, origen: OrigenUbicacion = 'manual', actualizarServicio: boolean = false): void {
    // Actualizar el mapa y marcador solo si están disponibles
    if (this.map && this.marker) {
      try {
        this.map.panTo(location);
        this.map.setZoom(15);
        this.marker.setPosition(location);
      } catch (error) {
        console.warn('No se pudo actualizar el mapa, pero se actualizará la dirección');
      }
    }

    // Siempre actualizar la dirección, incluso si el mapa no está disponible
    this.ngZone.run(() => {
      const direccionFinal = direccion || this.formatearCoordenadas(location);
      this.direccionSeleccionada = direccionFinal;
      this.ubicacionError = null;
      this.ubicacionDetectada = true;
    });

    if (this.autocompleteInput) {
      this.autocompleteInput.nativeElement.value = this.direccionSeleccionada;
    }

    const coordenadas = this.obtenerCoordenadas(location);
    const ubicacionRegistrada: UbicacionSeleccionada = {
      direccion: this.direccionSeleccionada,
      latitud: coordenadas.lat,
      longitud: coordenadas.lng,
      origen,
      timestamp: Date.now()
    };

    this.ubicacionActual = ubicacionRegistrada;

    if (actualizarServicio) {
      this.ubicacionService.establecerUbicacion(ubicacionRegistrada);
    }
  }

  confirmarUbicacion(): void {
    if (!this.ubicacionActual) {
      this.ubicacionError = 'Selecciona una ubicación en el mapa antes de guardar.';
      return;
    }

    this.ubicacionService.establecerUbicacion(this.ubicacionActual);
    this.cerrar.emit();
  }

  private obtenerDireccionDesdeCoordenadas(location: any, origen: OrigenUbicacion): void {
    const coords = this.obtenerCoordenadas(location);
    
    // Primero intenta con Google Maps Geocoder si está disponible
    if (this.geocoder && typeof google !== 'undefined' && google.maps) {
      this.geocoder.geocode({ location }, (results: any, status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const direccion = results[0].formatted_address;
          this.establecerUbicacion(location, direccion, origen);
        } else {
          // Servicio alternativo
          this.obtenerDireccionAlternativa(coords.lat, coords.lng, location, origen);
        }
      });
    } else {
      this.obtenerDireccionAlternativa(coords.lat, coords.lng, location, origen);
    }
  }

  private obtenerDireccionAlternativa(lat: number, lng: number, location: any, origen: OrigenUbicacion): void {
    // Usa Nominatim de OpenStreetMap 
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
    
    fetch(url, {
      headers: {
        'User-Agent': 'SistemaWebDAS/1.0'
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          // Formatea la dirección de manera más legible
          const direccion = this.formatearDireccionNominatim(data);
          this.establecerUbicacion(location, direccion, origen);
        } else {
          // Si todo falla, muestra coordenadas
          const direccionFallback = this.formatearCoordenadas(location);
          this.establecerUbicacion(location, direccionFallback, origen);
        }
      })
      .catch(() => {
        // Si hay error en la petición, muestra coordenadas
        const direccionFallback = this.formatearCoordenadas(location);
        this.establecerUbicacion(location, direccionFallback, origen);
      });
  }

  private formatearDireccionNominatim(data: any): string {
    // Intenta construir una dirección legible desde los datos de Nominatim
    const address = data.address || {};
    const partes: string[] = [];

    // Construye la dirección en orden lógico
    if (address.road || address.street) {
      partes.push(address.road || address.street);
    }
    if (address.house_number) {
      partes[partes.length - 1] = `${address.house_number}, ${partes[partes.length - 1]}`;
    }
    if (address.suburb || address.neighbourhood) {
      partes.push(address.suburb || address.neighbourhood);
    }
    if (address.city || address.town || address.village) {
      partes.push(address.city || address.town || address.village);
    }
    if (address.state || address.region) {
      partes.push(address.state || address.region);
    }
    
    if (partes.length === 0) {
      return data.display_name || 'Dirección no disponible';
    }

    return partes.join(', ');
  }

  private formatearCoordenadas(location: any): string {
    const coords = this.obtenerCoordenadas(location);
    return `Coordenadas: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
  }

  private obtenerCoordenadas(location: any): { lat: number; lng: number } {
    if (location) {
      if (typeof location.lat === 'function' && typeof location.lng === 'function') {
        return { lat: location.lat(), lng: location.lng() };
      }
      if (typeof location.lat === 'number' && typeof location.lng === 'number') {
        return { lat: location.lat, lng: location.lng };
      }
    }
    return this.centroPorDefecto;
  }

  private obtenerUbicacionPorIp(): Promise<{ lat: number; lng: number }> {
    return fetch('https://ipapi.co/json/')
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status === 429 ? 'rate_limit' : 'ip_error');
        }
        return response.json();
      })
      .then((data) => {
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          return { lat: data.latitude, lng: data.longitude };
        }
        throw new Error('ip_error');
      });
  }

  private registrarEventosMapa(): void {
    if (!this.map || !this.marker) {
      return;
    }

    this.map.addListener('click', (event: any) => {
      const latLng = event?.latLng;
      if (!latLng) {
        return;
      }
      this.ngZone.run(() => {
        this.establecerUbicacion(latLng, undefined, 'manual');
        this.obtenerDireccionDesdeCoordenadas(latLng, 'manual');
      });
    });

    this.marker.addListener('dragend', (event: any) => {
      const latLng = event?.latLng;
      if (!latLng) {
        return;
      }
      this.ngZone.run(() => {
        this.establecerUbicacion(latLng, undefined, 'manual');
        this.obtenerDireccionDesdeCoordenadas(latLng, 'manual');
      });
    });
  }
}
