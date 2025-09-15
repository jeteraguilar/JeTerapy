
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([
      (req, next) => {
        // Não adicionar token no endpoint de login
        if (req.url.includes('/api/auth/login')) {
          return next(req);
        }
        const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || null;
        if (token) {
          req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` }});
        }
        return next(req);
      }
    ]))
  ]
};