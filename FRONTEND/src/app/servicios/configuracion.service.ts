import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Servicio unificado de configuración (Stripe, notificaciones, configuraciones generales)
@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  // URLs centralizadas
  private baseUrl = 'http://localhost:8089';
  private apiUrl = `${this.baseUrl}/api`;
  private apiV1Url = `${this.baseUrl}/api/v1`;
  private notificacionesApiUrl = `${this.apiUrl}/admin/notificaciones`;

  constructor(private http: HttpClient) {}

  // ==================== CONFIGURACIÓN DE STRIPE ====================

  // Configuración de Stripe para el frontend
  getStripeConfig() {
    return {
      // Clave pública de Stripe en modo TEST
      publishableKey: 'pk_test_51SGkZhLdAZIW17N1eAhoP5LkSMpTzCKj8MW3OfQqpKvmHhiPs7MKQMqz1NWBpXY2QYyxbvAteKF0qK4YUA35rGbX00BhQCWlue',
      
      // Opciones de configuración
      options: {
        locale: 'es' as const, // Idioma español
      },
      
      // Apariencia de los elementos de Stripe
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

  // ==================== NOTIFICACIONES ====================

  // Notifica que un pedido está en camino
  notificarPedidoEnCamino(idPedido: number): Observable<any> {
    return this.http.put(`${this.notificacionesApiUrl}/pedido/${idPedido}/en-camino`, {});
  }

  // Notifica que un pedido fue entregado
  notificarPedidoEntregado(idPedido: number): Observable<any> {
    return this.http.put(`${this.notificacionesApiUrl}/pedido/${idPedido}/entregado`, {});
  }

  // Notifica que un pedido fue cancelado
  notificarPedidoCancelado(idPedido: number, motivo: string): Observable<any> {
    return this.http.put(`${this.notificacionesApiUrl}/pedido/${idPedido}/cancelado`, { motivo });
  }

  // ==================== CONFIGURACIONES GENERALES ====================

  // Obtiene la configuración general de la aplicación
  obtenerConfiguracionGeneral(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion`);
  }

  // Actualiza la configuración general de la aplicación
  actualizarConfiguracionGeneral(configuracion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuracion`, configuracion);
  }

  // ==================== CONFIGURACIONES DE PAGO ====================

  // Obtiene las configuraciones de métodos de pago
  obtenerMetodosPago(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion/metodos-pago`);
  }

  // Actualiza los métodos de pago disponibles
  actualizarMetodosPago(metodos: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuracion/metodos-pago`, { metodos });
  }

  // ==================== CONFIGURACIONES DE NOTIFICACIONES ====================

  // Obtiene las configuraciones de notificaciones
  obtenerConfiguracionNotificaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion/notificaciones`);
  }

  // Actualiza las configuraciones de notificaciones
  actualizarConfiguracionNotificaciones(configuracion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuracion/notificaciones`, configuracion);
  }

  // ==================== CONFIGURACIÓN DE URLs ====================

  // Obtiene la URL base de la API
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Obtiene la URL de la API v1
  getApiV1Url(): string {
    return this.apiV1Url;
  }

  // Obtiene la URL de la API
  getApiUrl(): string {
    return this.apiUrl;
  }
}
