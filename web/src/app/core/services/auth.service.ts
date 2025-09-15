import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usa rota relativa para aproveitar proxy /api e evitar problemas de CORS/host
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    console.log('[AUTH] Tentando login', email);
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          const candidate = response?.token || response?.accessToken || response?.access_token || response?.jwt || response?.data?.token;
          if (candidate) {
            try { localStorage.setItem('token', candidate); } catch {}
            try {
              const parts = candidate.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('[AUTH] JWT payload:', payload);
              }
            } catch (e) { console.warn('[AUTH] Falha ao decodificar JWT', e); }
          } else {
            console.warn('[AUTH] Nenhum token identificado no payload', response);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
