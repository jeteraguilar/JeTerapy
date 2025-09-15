import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
  MatNativeDateModule,
  MatIconModule
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent {
  form!: FormGroup;
  saving = false;
  errorMsg = '';
  appointmentOpts = [
    { id: 1, label: 'Terapia' },
    { id: 2, label: 'Mentoria de carreira' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private service: PaymentService) {
    // Inicializa o form após o DI garantir fb disponível
    this.form = this.fb.group({
      appointmentId: [null, Validators.required],
      amount: ['', Validators.required],
      dueDate: [null as unknown as Date, Validators.required],
      status: ['PENDING']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.get(id).subscribe((p) => {
        // Converte dueDate (ISO) para Date pro datepicker
        let parsedDate: Date | null = null;
        try { parsedDate = p.dueDate ? new Date(p.dueDate) : null; } catch {}
        this.form.patchValue({
          appointmentId: (p as any).appointmentId ?? null,
          amount: p.amount,
          dueDate: parsedDate,
          status: p.status
        });
      });
    }
  }

  save() {
    if (!this.form.valid || this.saving) return;
    this.saving = true;
    this.errorMsg = '';
  const raw = this.form.value as { appointmentId: number; amount: any; dueDate: any; status: string };
  // Formata data para yyyy-MM-dd
  const d: Date = raw.dueDate instanceof Date ? raw.dueDate : new Date(raw.dueDate);
  const due = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  // Normaliza valor com vírgula para ponto (ex: 100,50 -> 100.50)
  const amt = typeof raw.amount === 'string' ? Number(raw.amount.replace(/\./g,'').replace(',','.')) : Number(raw.amount);
  const payload = { appointmentId: Number(raw.appointmentId), amount: amt, dueDate: due, status: raw.status } as any;
    const id = this.route.snapshot.paramMap.get('id');
    console.log('[PAYMENTS] Salvando pagamento', payload);
  const obs = id ? this.service.update(id, payload) : this.service.create(payload);
    obs.subscribe({
      next: () => { this.router.navigate(['/payments']); },
      error: (err) => {
        console.error('Erro ao salvar pagamento', err);
        const backendMsg = err?.error?.message || err?.error?.error || '';
        this.errorMsg = backendMsg ? backendMsg : 'Não foi possível salvar. Verifique permissões ou campos.';
        this.saving = false;
      }
    });
  }

  goBack() {
    try { this.form.reset({ appointmentId: null, amount: '', dueDate: null, status: 'PENDING' }); } catch {}
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/payments']);
    }
  }
}
