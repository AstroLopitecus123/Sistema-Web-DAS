import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {
  private baseUrl: string = 'http://localhost:8089';
  private apiUrl: string = `${this.baseUrl}/api/v1/usuarios`;

  constructor(private http: HttpClient) {}

  async inicializarOneSignal(userId: number): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      let attempts = 0;
      while (attempts < 20 && !(window as any).OneSignal) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      if (!(window as any).OneSignal) {
        return null;
      }

      const OneSignal = (window as any).OneSignal;
      
      if (!OneSignal.isInitialized || !OneSignal.isInitialized()) {
        try {
          await OneSignal.init({
            appId: "f85f52a8-9f49-4911-b4c0-eaef333f03b8",
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/' }
          });
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Error al inicializar OneSignal:', error);
          return null;
        }
      }
      
      await this.solicitarPermisos(OneSignal);
      
      const permissionStatus = OneSignal.Notifications?.permissionNative || 
                               (('Notification' in window) ? Notification.permission : 'default');
      
      if (permissionStatus !== 'granted') {
        return null;
      }
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length === 0) {
          try {
            await navigator.serviceWorker.register('/OneSignalSDKWorker.js', { scope: '/' });
          } catch (e) {
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      let playerId: string | null = null;
      for (let i = 0; i < 5; i++) {
        if (OneSignal.User?.PushSubscription?.id) {
          playerId = OneSignal.User.PushSubscription.id;
          break;
        }
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (playerId) {
        try {
          await this.guardarPlayerId(userId, playerId).toPromise();
        } catch (error) {
          console.error('Error al guardar Player ID:', error);
        }
        return playerId;
      }
      
      return null;
    } catch (error) {
      console.error('Error al inicializar OneSignal:', error);
      return null;
    }
  }

  private async solicitarPermisos(OneSignal: any): Promise<void> {
    try {
      const permissionStatus = OneSignal.Notifications?.permissionNative || 
                               (('Notification' in window) ? Notification.permission : 'default');
      
      if (permissionStatus === 'default') {
        if (OneSignal.Slidedown?.promptPushSlidedown) {
          try {
            await OneSignal.Slidedown.promptPushSlidedown();
          } catch (e) {
            if ('Notification' in window && Notification.permission === 'default') {
              await Notification.requestPermission();
            }
          }
        } else if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    } catch (error) {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
        }
      }
    }
  }

  private guardarPlayerId(userId: number, playerId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/player-id/${userId}`, { playerId });
  }
}
