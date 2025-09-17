import { Component, Inject, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

export interface AppointmentItem {
  id?: string;
  patient: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  status?: string;
}

@Component({
  selector: 'app-edit-appointment-dialog',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './edit-appointment-dialog.component.html',
  styleUrls: ['./edit-appointment-dialog.component.scss']
})
export class EditAppointmentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditAppointmentDialogComponent>);
  success = '';
  error = '';
  form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AppointmentItem) {
    this.form = this.fb.group({
      patient: [data.patient, [Validators.required, Validators.minLength(2)]],
      date: [data.date, Validators.required],
      time: [data.time, Validators.required],
      status: [data.status || 'SCHEDULED']
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
    const updated: AppointmentItem = { ...this.data, ...this.form.getRawValue() };
    this.success = 'Atendimento salvo com sucesso!';
    setTimeout(() => this.dialogRef.close(updated), 1200);
  }
  cancel() { this.dialogRef.close(null); }
}
