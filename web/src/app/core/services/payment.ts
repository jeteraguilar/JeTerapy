import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Payment {
  id?: string;
  // Backend espera appointmentId; 'appointment' pode existir em respostas legadas
  appointmentId?: number;
  appointment?: string;
  amount: number;
  dueDate: string; // ISO date
  status: 'PENDING' | 'PAID' | 'CANCELLED';
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // Caminho relativo usando proxy /api (SSR/Express). Fallback absoluto se necessário.
  private apiUrl = '/api/payments';
  private absoluteApiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  list(params: { q?: string } = {}): Observable<Payment[]> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    return this.http.get<Payment[]>(this.apiUrl, { params: httpParams });
  }

  get(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  create(data: Payment): Observable<Payment> {
    console.log('[PAYMENTS] POST (relativo)', data);
    return this.http.post<Payment>(this.apiUrl, data).pipe(
      catchError(err => {
        if (err.status === 403) {
          console.warn('[PAYMENTS] 403 no proxy relativo. Tentando absoluto.');
          return this.http.post<Payment>(this.absoluteApiUrl, data).pipe(
            catchError(inner => {
              console.error('[PAYMENTS] Falhou fallback absoluto', inner);
              return throwError(() => inner);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  update(id: string, data: Partial<Payment>): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
