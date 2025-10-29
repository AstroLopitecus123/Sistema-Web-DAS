import { Injectable } from '@angular/core';

export interface Cupon {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDescuento: 'porcentaje' | 'monto_fijo';
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  montoMinimo: number;
  activo: boolean;
  usado: boolean;
  fechaUso?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CuponesService {

  // Categoriza los cupones en disponibles, usados y expirados
  categorizarCupones(cupones: Cupon[]): {
    cuponesDisponibles: Cupon[];
    cuponesUsados: Cupon[];
    cuponesExpirados: Cupon[];
  } {
    const ahora = new Date();
    
    const cuponesDisponibles = cupones.filter(cupon => 
      cupon.activo && !cupon.usado && new Date(cupon.fechaFin) >= ahora
    );
    
    const cuponesUsados = cupones.filter(cupon => cupon.usado);
    
    const cuponesExpirados = cupones.filter(cupon => 
      !cupon.usado && new Date(cupon.fechaFin) < ahora
    );

    return {
      cuponesDisponibles,
      cuponesUsados,
      cuponesExpirados
    };
  }

  // Calcula las estadísticas de cupones
  calcularEstadisticas(cuponesDisponibles: Cupon[], cuponesUsados: Cupon[]): {
    cuponesDisponibles: number;
    cuponesUsados: number;
    ahorradoEsteMes: number;
  } {
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

  // Valida si un cupón es válido
  validarCupon(cupon: Cupon): { valido: boolean; mensaje?: string } {
    const ahora = new Date();
    const fechaFin = new Date(cupon.fechaFin);

    if (cupon.usado) {
      return { valido: false, mensaje: 'Este cupón ya ha sido usado' };
    }

    if (!cupon.activo) {
      return { valido: false, mensaje: 'Este cupón no está activo' };
    }

    if (fechaFin <= ahora) {
      return { valido: false, mensaje: 'Este cupón ha expirado' };
    }

    return { valido: true };
  }

  // Aplica un cupón a un total
  aplicarCupon(total: number, cupon: Cupon): number {
    if (cupon.tipoDescuento === 'porcentaje') {
      return total * (1 - cupon.valorDescuento / 100);
    } else {
      return Math.max(0, total - cupon.valorDescuento);
    }
  }
}
