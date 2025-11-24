import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

interface CuponResponse {
  idCupon: number;
  codigo: string;
  tipoDescuento: string;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadDisponible?: number;
  usosMaximosPorUsuario: number;
  montoMinimoCompra: number;
  activo: boolean;
  fechaCreacion: string;
  creadoPorAdmin: string;
}

@Injectable({
  providedIn: 'root'
})
export class CuponesService {
  private apiUrl = 'http://localhost:8089/api/v1/cupones';

  constructor(private http: HttpClient) {}

  obtenerCuponesDisponibles(idUsuario: number): Observable<Cupon[]> {
    return this.http.get<CuponResponse[]>(`${this.apiUrl}/disponibles/${idUsuario}`)
      .pipe(
        map(cupones => cupones.map(c => this.convertirACupon(c)))
      );
  }

  obtenerCuponesUsados(idUsuario: number): Observable<Cupon[]> {
    return this.http.get<CuponResponse[]>(`${this.apiUrl}/usados/${idUsuario}`)
      .pipe(
        map(cupones => cupones.map(c => this.convertirACupon(c, true)))
      );
  }

  obtenerCuponesExpirados(idUsuario: number): Observable<Cupon[]> {
    return this.http.get<CuponResponse[]>(`${this.apiUrl}/expirados/${idUsuario}`)
      .pipe(
        map(cupones => cupones.map(c => this.convertirACupon(c, false)))
      );
  }

  private convertirACupon(response: CuponResponse, usado: boolean = false): Cupon {
    let descripcion = '';
    if (response.tipoDescuento === 'porcentaje') {
      descripcion = `${response.valorDescuento}% de descuento`;
    } else {
      descripcion = `S/ ${response.valorDescuento} de descuento`;
    }
    
    if (response.montoMinimoCompra && response.montoMinimoCompra > 0) {
      descripcion += ` en compras mayores a S/ ${response.montoMinimoCompra}`;
    }

    return {
      id: response.idCupon,
      codigo: response.codigo,
      descripcion: descripcion,
      tipoDescuento: response.tipoDescuento as 'porcentaje' | 'monto_fijo',
      valorDescuento: response.valorDescuento,
      fechaInicio: response.fechaInicio,
      fechaFin: response.fechaFin,
      montoMinimo: response.montoMinimoCompra || 0,
      activo: response.activo,
      usado: usado
    };
  }

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

  calcularEstadisticas(cuponesDisponibles: Cupon[], cuponesUsados: Cupon[]): {
    cuponesDisponibles: number;
    cuponesUsados: number;
    ahorradoEsteMes: number;
  } {
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

  aplicarCupon(total: number, cupon: Cupon): number {
    if (cupon.tipoDescuento === 'porcentaje') {
      return total * (1 - cupon.valorDescuento / 100);
    } else {
      return Math.max(0, total - cupon.valorDescuento);
    }
  }
}
