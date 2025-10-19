import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { NucleoService } from './servicios/nucleo.service'; 
import { CarritoService } from './servicios/carrito.service';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideHttpClient(withInterceptorsFromDi()),
    
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NucleoService,
      multi: true 
    },
    
    {
      provide: LOCALE_ID,
      useValue: 'es'
    },
    
    CarritoService
  ]
};
