import { Injectable } from '@angular/core';
import { Usuario } from '../modelos/usuario.model';

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

  /**
   * Calcula las estadísticas del usuario
   * En una implementación real, esto vendría del backend
   */
  calcularEstadisticasUsuario(usuario: Usuario | null): EstadisticasUsuario {
    if (!usuario) {
      return {
        pedidosRealizados: 0,
        totalGastado: 0,
        cuponesUsados: 0
      };
    }

    // Simular estadísticas basadas en el usuario
    // En producción, esto debería venir del backend
    return {
      pedidosRealizados: 10,
      totalGastado: 487.00,
      cuponesUsados: 7
    };
  }

  /**
   * Calcula las estadísticas de cupones
   */
  calcularEstadisticasCupones(cuponesDisponibles: any[], cuponesUsados: any[]): EstadisticasCupones {
    const cuponesDisponiblesCount = cuponesDisponibles.length;
    const cuponesUsadosCount = cuponesUsados.length;
    
    // Simular ahorro del mes
    const ahorradoEsteMes = cuponesUsados.reduce((total, cupon) => {
      return total + (cupon.tipoDescuento === 'porcentaje' ? 15 : cupon.valorDescuento);
    }, 0);

    return {
      cuponesDisponibles: cuponesDisponiblesCount,
      cuponesUsados: cuponesUsadosCount,
      ahorradoEsteMes
    };
  }

  /**
   * Obtiene estadísticas desde el backend (para implementación futura)
   */
  obtenerEstadisticasDesdeBackend(usuarioId: number): Promise<EstadisticasUsuario> {
    // TODO: Implementar llamada al backend
    return Promise.resolve({
      pedidosRealizados: 0,
      totalGastado: 0,
      cuponesUsados: 0
    });
  }
}
