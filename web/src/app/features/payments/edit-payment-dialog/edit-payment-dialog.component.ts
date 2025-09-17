import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../../core/services/payment';

export interface PaymentItem { id?: string; appointment?: string; amount: number; status: string; dueDate: string }

@Component({
  selector: 'app-edit-payment-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './edit-payment-dialog.component.html',
  styleUrls: ['./edit-payment-dialog.component.scss']
})
export class EditPaymentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditPaymentDialogComponent>);
  private service = inject(PaymentService);
  form: FormGroup;
  success = '';
  error = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: PaymentItem) {
    this.form = this.fb.group({
      appointment: [data.appointment || '', Validators.required],
      amount: [data.amount, Validators.required],
      status: [data.status || 'PENDING', Validators.required],
      dueDate: [data.dueDate, Validators.required]
    });
  }

  submit() {
    this.error = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error = 'Preencha os campos corretamente para continuar.'; return; }
    const updated: PaymentItem = { ...this.data, ...this.form.getRawValue() };
    // Se houver id, faz update no backend; caso contrário, retorna dados atualizados localmente
    const id = (this.data as any).id;
    if (id) {
      this.service.update(id, updated as any).subscribe({
        next: (resp) => {
          this.success = 'Pagamento salvo com sucesso!';
          setTimeout(() => this.dialogRef.close(resp), 1200);
        },
        error: () => {
          this.error = 'Falha ao salvar pagamento.';
        }
      });
    } else {
      this.success = 'Pagamento salvo com sucesso!';
      setTimeout(() => this.dialogRef.close(updated), 1200);
    }
  }
  cancel() { this.dialogRef.close(null); }
}
