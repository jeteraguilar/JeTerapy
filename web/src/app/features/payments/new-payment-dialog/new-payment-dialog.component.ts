import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService, Payment } from '../../../core/services/payment';

@Component({
  selector: 'app-new-payment-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './new-payment-dialog.component.html',
  styleUrls: ['./new-payment-dialog.component.scss']
})
export class NewPaymentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NewPaymentDialogComponent>);
  private service = inject(PaymentService);

  form: FormGroup = this.fb.group({
    consultationType: ['TERAPIA', [Validators.required]],
    amount: [null, [Validators.required, Validators.min(0)]],
    method: [''],
    dueDate: ['', Validators.required]
  });

  success = '';
  error = '';
  loading = false;

  submit() {
    this.error = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error = 'Preencha os campos corretamente para continuar.'; return; }
    const v = this.form.getRawValue();
    const payload: Payment = {
      amount: Number(v.amount),
      method: v.method || undefined,
      dueDate: v.dueDate,
      consultationType: v.consultationType
    } as any;
    this.loading = true;
    this.service.create(payload).subscribe({
      next: (created) => {
        this.success = 'Pagamento criado com sucesso!';
        setTimeout(() => this.dialogRef.close(created), 1200);
      },
      error: (err) => {
        this.error = 'Falha ao salvar pagamento.';
      }
    }).add(() => this.loading = false);
  }
  cancel() { this.dialogRef.close(null); }
}
