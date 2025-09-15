import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Patient {
  id: string; // UUID no backend
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página atual (0-based)
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = '/api/patients';

  constructor(private http: HttpClient) {}

  // Lista paginada conforme o controller Spring
  list(params: { q?: string; page?: number; size?: number } = {}): Observable<Page<Patient>> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (typeof params.page === 'number') httpParams = httpParams.set('page', String(params.page));
    if (typeof params.size === 'number') httpParams = httpParams.set('size', String(params.size));
    return this.http.get<Page<Patient>>(this.apiUrl, { params: httpParams });
  }

  // Compat: obtem primeira página e devolve apenas o conteúdo
  getPatients(size = 10): Observable<Patient[]> {
    return this.list({ page: 0, size }).pipe(map((p) => p.content));
  }

  getPatient(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  addPatient(data: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, data);
  }

  updatePatient(id: string, data: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, data);
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
