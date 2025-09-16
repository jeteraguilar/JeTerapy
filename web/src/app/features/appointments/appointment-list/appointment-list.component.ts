import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditAppointmentDialogComponent, AppointmentItem } from '../edit-appointment-dialog/edit-appointment-dialog.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent {
  displayedColumns = ['patient', 'date', 'time', 'status', 'actions'];
  appointments: AppointmentItem[] = [
    { patient: 'Marcia Gonçalvez', date: '2025-09-02', time: '14:00', status: 'CONFIRMED' },
    { patient: 'João Silva', date: '2025-09-03', time: '09:30', status: 'SCHEDULED' }
  ];
  private allAppointments: AppointmentItem[] = this.appointments;
  success = '';
  error = '';
  loading = false;
  q = '';
  page = 0;
  totalPages = 1;
  total = this.appointments.length;
  constructor(private router: Router, private location: Location, private dialog: MatDialog) {}
  new() { this.router.navigate(['/appointments/new']); }
  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/menu']);
    }
  }

  edit(row: AppointmentItem) {
    const ref = this.dialog.open(EditAppointmentDialogComponent, { width: '640px', data: row });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const idx = this.appointments.indexOf(row);
        if (idx >= 0) {
          this.appointments[idx] = result;
          this.appointments = [...this.appointments];
          this.success = 'Atendimento atualizado com sucesso!';
          setTimeout(() => (this.success = ''), 2500);
        }
      }
    });
  }

  applyFilter() {
    const term = this.q?.trim().toLowerCase();
    let filtered = this.allAppointments;
    if (term) {
      filtered = this.allAppointments.filter((a) =>
        a.patient.toLowerCase().includes(term) || (a.status || '').toLowerCase().includes(term)
      );
    }
    this.appointments = filtered;
    this.total = filtered.length;
    this.totalPages = 1;
    this.page = 0;
  }
  search() { this.applyFilter(); }
  prev() { if (this.page > 0) this.page--; }
  next() { if (this.page + 1 < this.totalPages) this.page++; }
}
