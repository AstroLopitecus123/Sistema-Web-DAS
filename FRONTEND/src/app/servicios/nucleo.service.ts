import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

// Servicio principal para interceptores HTTP y manejo de errores
@Injectable({
  providedIn: 'root'
})
export class NucleoService implements HttpInterceptor {

  constructor() {}

  // Interceptor para headers y manejo de errores
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // Añadir headers de caché y token de autenticación
    const token = localStorage.getItem('token');
    
    const headers: { [key: string]: string } = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    const url = request.url || '';
    const esAuthPublico = url.includes('/api/auth/login') ||
      url.includes('/api/auth/registro') ||
      url.includes('/api/auth/recuperar-contrasena') ||
      url.includes('/api/auth/restablecer-contrasena');

    if (token && !esAuthPublico) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const modifiedRequest = request.clone({
      setHeaders: headers
    });

    return next.handle(modifiedRequest)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Solo manejar errores reales (códigos 4xx y 5xx)
          if (error.status >= 400) {
            return this.handleError(error);
          }
          // Para códigos 2xx y 3xx, no hacer nada especial
          return throwError(() => error);
        })
      );
  }

  // Manejo centralizado de errores HTTP
  public handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido en el lado del cliente.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente o de red: ${error.error.message}`;
    } 
    else {
      console.error(
        `[Servidor] Código de error: ${error.status}, ` +
        `Cuerpo del error: ${JSON.stringify(error.error)}`
      );

      // Manejo especial para errores de login
      if (error.url && error.url.includes('/api/auth/login')) {
        const mensajeServidor = (error.error && (error.error.mensaje || error.error.message)) || '';
        if (mensajeServidor === 'CUENTA_DESACTIVADA') {
          errorMessage = 'Tu cuenta ha sido desactivada por un administrador. Contacta con soporte para más información.';
          (error as any).codigo = 'CUENTA_DESACTIVADA';
        } else if (error.error && (error.error.mensaje || error.error.message)) {
          errorMessage = error.error.mensaje || error.error.message;
        } else {
          switch (error.status) {
            case 401:
              errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
              break;
            case 403:
              errorMessage = 'Tu cuenta ha sido desactivada por un administrador. Contacta con soporte para más información.';
              break;
            case 400:
              errorMessage = 'Datos de entrada inválidos.';
              break;
            default:
              errorMessage = `Error ${error.status}: Algo salió mal al conectar con el servidor.`;
          }
        }
      } else {
        // Mensajes genéricos para otros endpoints
        switch (error.status) {
          case 401:
            errorMessage = 'Error de autenticación: Por favor, inicia sesión de nuevo.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado: La ruta de la API no existe.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo de nuevo más tarde.';
            break;
          default:
            errorMessage = `Error ${error.status}: Algo salió mal al conectar con el servidor.`;
        }
      }
    }

    console.warn(`[Mensaje para el Usuario] ${errorMessage}`);

    const customError = new Error(errorMessage);
    (customError as any).status = error.status;
    (customError as any).statusText = error.statusText;
    (customError as any).error = error.error;
    (customError as any).url = error.url;
    if ((error as any).codigo) {
      (customError as any).codigo = (error as any).codigo;
    }

    return throwError(() => customError);
  }

  // Utilidades centrales

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Establece el token de autenticación en el localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Elimina el token de autenticación del localStorage
  removeToken(): void {
    localStorage.removeItem('token');
  }

  // Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  // Obtiene información del usuario desde el token
  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Verifica si el token está expirado
  isTokenExpired(): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return userInfo.exp < currentTime;
  }

  // Limpia toda la información de sesión
  clearSession(): void {
    this.removeToken();
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito');
  }
}
