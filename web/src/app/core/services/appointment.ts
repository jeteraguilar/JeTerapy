import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentCreate {
  therapistId: string; // UUID
  patientId: string;   // UUID
  startTime: string;   // ISO LocalDateTime
  endTime: string;     // ISO LocalDateTime
  location?: string;
  status?: string;
}

export interface AppointmentResponse {
  id: string;
  therapistId: string;
  patientId: string;
  start: string;
  end: string;
  status: string;
  location?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = '/api/appointments';
  constructor(private http: HttpClient) {}

  create(data: AppointmentCreate): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(this.apiUrl, data);
  }

  updateStatus(id: string, status: string): Observable<AppointmentResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}/status`, null, { params });
  }
}


@Injectable({
  providedIn: 'root'
})
export class Appointment {
  
}
