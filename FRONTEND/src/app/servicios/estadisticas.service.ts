import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Usuario } from '../modelos/usuario.model';
import { ConfiguracionService } from './configuracion.service';

export interface EstadisticasUsuario {
  pedidosRealizados: number;
  totalGastado: number;
  cuponesUsados: number;
}

export interface EstadisticasCupones {
  cuponesDisponibles: number;
  cuponesUsados: number;
  ahorradoEsteMes: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  constructor(
    private http: HttpClient,
    private configuracionService: ConfiguracionService
  ) {}

  // Obtiene las estadísticas del usuario desde el backend
  obtenerEstadisticasUsuario(idUsuario: number): Observable<EstadisticasUsuario> {
    const url = `${this.configuracionService.getApiV1Url()}/usuarios/estadisticas/${idUsuario}`;
    
    return this.http.get<EstadisticasUsuario>(url).pipe(
      map(response => ({
        pedidosRealizados: response.pedidosRealizados || 0,
        totalGastado: response.totalGastado || 0,
        cuponesUsados: response.cuponesUsados || 0
      })),
      catchError(error => {
        console.error('Error al obtener estadísticas del usuario:', error);
        // Retornar valores por defecto en caso de error
        return of({
          pedidosRealizados: 0,
          totalGastado: 0,
          cuponesUsados: 0
        });
      })
    );
  }

  // Calcula las estadísticas del usuario (método legacy - mantenido por compatibilidad)
  calcularEstadisticasUsuario(usuario: Usuario | null): EstadisticasUsuario {
    if (!usuario) {
      return {
        pedidosRealizados: 0,
        totalGastado: 0,
        cuponesUsados: 0
      };
    }

    // Valores por defecto mientras se cargan los datos reales
    return {
      pedidosRealizados: 0,
      totalGastado: 0,
      cuponesUsados: 0
    };
  }

  // Calcula las estadísticas de cupones
  calcularEstadisticasCupones(cuponesDisponibles: any[], cuponesUsados: any[]): EstadisticasCupones {
    const cuponesDisponiblesCount = cuponesDisponibles.length;
    const cuponesUsadosCount = cuponesUsados.length;
    
    const ahorradoEsteMes = cuponesUsados.reduce((total, cupon) => {
      return total + (cupon.tipoDescuento === 'porcentaje' ? 15 : cupon.valorDescuento);
    }, 0);

    return {
      cuponesDisponibles: cuponesDisponiblesCount,
      cuponesUsados: cuponesUsadosCount,
      ahorradoEsteMes
    };
  }

  // Obtiene estadísticas desde el backend (para implementación futura)
  obtenerEstadisticasDesdeBackend(usuarioId: number): Promise<EstadisticasUsuario> {
    return Promise.resolve({
      pedidosRealizados: 0,
      totalGastado: 0,
      cuponesUsados: 0
    });
  }
}
