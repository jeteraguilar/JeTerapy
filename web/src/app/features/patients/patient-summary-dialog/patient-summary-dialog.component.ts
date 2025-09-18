import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PatientService, Patient } from '../../../core/services/patient';
import { formatPhoneDisplay, normalizePhoneDigits } from '../../../core/util/phone.util';

export interface PatientSummaryData extends Patient {
  paymentStatus?: 'PENDING' | 'PAID' | 'LATE';
  sessionStatus?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'DONE';
}

@Component({
  selector: 'app-patient-summary-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './patient-summary-dialog.component.html',
  styleUrls: ['./patient-summary-dialog.component.scss']
})
export class PatientSummaryDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PatientSummaryDialogComponent>);
  private patientService = inject(PatientService);

  form: FormGroup;
  success = '';
  error = '';
  saving = false;

  paymentStatusOptions = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' },
    { value: 'LATE', label: 'Atrasado' }
  ];
  sessionStatusOptions = [
    { value: 'SCHEDULED', label: 'Agendado' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'DONE', label: 'Realizado' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PatientSummaryData) {
    this.form = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(2)]],
      paymentStatus: [data.paymentStatus || 'PENDING'],
      sessionStatus: [data.sessionStatus || 'SCHEDULED'],
      contractType: [data.contractType || 'INDIVIDUAL']
    });
  }

  get formattedPhone(): string {
    const digits = normalizePhoneDigits(this.data.phone);
    return formatPhoneDisplay(digits) || '—';
  }

  submit() {
    this.error = ''; this.success = '';
    if (this.form.invalid || !this.data.id) {
      this.form.markAllAsTouched();
      this.error = 'Preencha os campos corretamente.';
      return;
    }
    const { name, contractType } = this.form.getRawValue();
    this.saving = true;
    this.patientService.updatePatient(this.data.id!, { name, contractType }).subscribe({
      next: (updated: Patient) => {
        const merged: PatientSummaryData = { ...updated, paymentStatus: this.form.value.paymentStatus, sessionStatus: this.form.value.sessionStatus, contractType: this.form.value.contractType };
        this.success = 'Dados salvos com sucesso!';
        setTimeout(() => this.dialogRef.close(merged), 1000);
      },
      error: () => {
        this.error = 'Falha ao salvar.';
      }
    }).add(() => this.saving = false);
  }
  cancel() { this.dialogRef.close(null); }
}
