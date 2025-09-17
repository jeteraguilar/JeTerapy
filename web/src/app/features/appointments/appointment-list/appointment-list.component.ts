import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditAppointmentDialogComponent, AppointmentItem } from '../edit-appointment-dialog/edit-appointment-dialog.component';
import { NewAppointmentDialogComponent, NewAppointmentItem } from '../new-appointment-dialog/new-appointment-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../../shared/confirm-delete-dialog/confirm-delete-dialog.component';
import { AppointmentService } from '../../../core/services/appointment';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
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
  constructor(private router: Router, private location: Location, private dialog: MatDialog, private appointmentService: AppointmentService) {}
  new() { this.router.navigate(['/appointments/new']); }
  newFromDialog() {
    const therapistId = '00000000-0000-0000-0000-000000000001'; // TODO: obter do contexto/autenticação
    const ref = this.dialog.open(NewAppointmentDialogComponent, { width: '640px', data: { therapistId } });
    ref.afterClosed().subscribe((created: NewAppointmentItem | undefined) => {
      if (created) {
        this.appointments = [created as any, ...this.appointments];
        this.allAppointments = this.appointments;
        this.total = this.appointments.length;
        this.success = 'Atendimento criado com sucesso!';
        setTimeout(() => (this.success = ''), 2500);
      }
    });
  }
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

  cancel(row: AppointmentItem) {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: 'Cancelar Agendamento',
        message: `Tem certeza que deseja cancelar este agendamento de ${row.patient}?`,
        confirmLabel: 'Cancelar Agendamento'
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      if ((row as any).id) {
        this.appointmentService.updateStatus((row as any).id, 'CANCELLED').subscribe({
          next: (resp) => {
            row.status = resp.status || 'CANCELLED';
            this.appointments = [...this.appointments];
            this.success = 'Agendamento cancelado com sucesso!';
            setTimeout(() => (this.success = ''), 2500);
          },
          error: () => {
            this.error = 'Falha ao cancelar agendamento.';
            setTimeout(() => (this.error = ''), 3500);
          }
        });
      } else {
        // fallback local
        row.status = 'CANCELLED';
        this.appointments = [...this.appointments];
        this.success = 'Agendamento cancelado com sucesso!';
        setTimeout(() => (this.success = ''), 2500);
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
