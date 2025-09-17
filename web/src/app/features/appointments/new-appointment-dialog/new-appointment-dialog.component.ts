import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PatientService, Patient } from '../../../core/services/patient';
import { AppointmentService, AppointmentCreate } from '../../../core/services/appointment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NewAppointmentItem {
  id?: string;
  patient: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  status?: string;
}

@Component({
  selector: 'app-new-appointment-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './new-appointment-dialog.component.html',
  styleUrls: ['./new-appointment-dialog.component.scss']
})
export class NewAppointmentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NewAppointmentDialogComponent>);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);

  success = '';
  error = '';
  patients: Patient[] = [];
  form: FormGroup = this.fb.group({
    patient: ['', [Validators.required]], // holds patientId (UUID)
    date: ['', Validators.required],
    time: ['', Validators.required],
    status: ['SCHEDULED']
  });

  constructor(@Inject(MAT_DIALOG_DATA) private data: { therapistId: string }) {}

  ngOnInit() {
    // carrega até 100 pacientes para o combo
    this.patientService.getPatients(100).subscribe({
      next: (list) => (this.patients = list),
      error: () => (this.patients = [])
    });
  }

  submit() {
    this.error = '';
    this.success = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Preencha os campos corretamente para continuar.';
      return;
    }
    const v = this.form.getRawValue();
    // monta start/end (30min de duração por padrão)
    const start = `${v.date}T${v.time}:00`;
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const end = endDate.toISOString().slice(0,19); // yyyy-MM-ddTHH:mm:ss

    const payload: AppointmentCreate = {
      therapistId: this.data?.therapistId,
      patientId: v.patient,
      startTime: start,
      endTime: end,
      status: v.status
    };

    this.appointmentService.create(payload).subscribe({
      next: (resp) => {
        // Enriquecer com nome do paciente para a lista da UI
        const p = this.patients.find(x => x.id === v.patient);
        const ui = { id: resp.id, patient: p?.name || v.patient, date: v.date, time: v.time, status: resp.status };
        this.success = 'Atendimento criado com sucesso!';
        setTimeout(() => this.dialogRef.close(ui), 1200);
      },
      error: () => {
        this.error = 'Falha ao salvar atendimento.';
      }
    });
  }
  cancel() { this.dialogRef.close(null); }
}
