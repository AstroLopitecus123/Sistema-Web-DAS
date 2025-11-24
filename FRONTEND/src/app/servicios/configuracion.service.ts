import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private baseUrl = 'http://localhost:8089';
  private apiUrl = `${this.baseUrl}/api`;
  private apiV1Url = `${this.baseUrl}/api/v1`;
  private notificacionesApiUrl = `${this.apiUrl}/admin/notificaciones`;

  constructor(private http: HttpClient) {}

  getStripeConfig() {
    return {
      publishableKey: 'pk_test_51SGkZhLdAZIW17N1eAhoP5LkSMpTzCKj8MW3OfQqpKvmHhiPs7MKQMqz1NWBpXY2QYyxbvAteKF0qK4YUA35rGbX00BhQCWlue',
      
      options: {
        locale: 'es' as const,
      },
      
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#0066cc',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
        rules: {
          '.Input': {
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '12px',
          }
        }
      }
    };
  }

  notificarPedidoEnCamino(idPedido: number): Observable<any> {
    return this.http.put(`${this.notificacionesApiUrl}/pedido/${idPedido}/en-camino`, {});
  }

  notificarPedidoEntregado(idPedido: number): Observable<any> {
    return this.http.put(`${this.notificacionesApiUrl}/pedido/${idPedido}/entregado`, {});
  }

  notificarPedidoCancelado(idPedido: number, motivo: string): Observable<any> {
    return this.http.put(`${this.notificacionesApiUrl}/pedido/${idPedido}/cancelado`, { motivo });
  }

  obtenerConfiguracionGeneral(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion`);
  }

  actualizarConfiguracionGeneral(configuracion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuracion`, configuracion);
  }

  obtenerMetodosPago(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion/metodos-pago`);
  }

  actualizarMetodosPago(metodos: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuracion/metodos-pago`, { metodos });
  }

  obtenerConfiguracionNotificaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion/notificaciones`);
  }

  actualizarConfiguracionNotificaciones(configuracion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuracion/notificaciones`, configuracion);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiV1Url(): string {
    return this.apiV1Url;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
