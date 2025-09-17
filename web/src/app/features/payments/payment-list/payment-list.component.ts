import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditPaymentDialogComponent, PaymentItem } from '../edit-payment-dialog/edit-payment-dialog.component';
import { NewPaymentDialogComponent } from '../new-payment-dialog/new-payment-dialog.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PaymentService, Payment } from '../../../core/services/payment';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass, FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent {
  displayedColumns = ['appointment', 'amount', 'status', 'dueDate', 'actions'];
  payments: Payment[] = [];
  private allPayments: Payment[] = [];
  success = '';
  error = '';
  loading = false;
  q = '';
  page = 0;
  totalPages = 1;
  total = 0;

  constructor(private service: PaymentService, private router: Router, private location: Location, private dialog: MatDialog) {
    this.load();
  }

  load() {
    this.error = '';
    this.loading = true;
    this.service.list().subscribe({
      next: (data) => {
        this.allPayments = data;
        this.applyFilter();
      },
      error: () => {
        this.error = 'Erro ao carregar pagamentos.';
      }
    }).add(() => (this.loading = false));
  }

  applyFilter() {
    const term = this.q?.trim().toLowerCase();
    let filtered = this.allPayments;
    if (term) {
      filtered = this.allPayments.filter((p: any) =>
        (p.appointment || '').toLowerCase().includes(term) ||
        (p.status || '').toLowerCase().includes(term)
      );
    }
    this.payments = filtered;
    this.total = filtered.length;
    this.totalPages = 1; // placeholder while no server-side paging
    this.page = 0;
  }

  search() { this.applyFilter(); }

  edit(row: Payment) {
    if (!row.id) return;
    const data: PaymentItem = {
      id: row.id,
      appointment: (row as any).appointment || '',
      amount: row.amount,
      status: (row as any).status || 'PENDING',
      dueDate: (row as any).dueDate || ''
    };
    const ref = this.dialog.open(EditPaymentDialogComponent, { width: '640px', data });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const idx = this.payments.findIndex(p => p.id === row.id);
        if (idx >= 0) {
          this.payments[idx] = { ...this.payments[idx], ...result } as any;
          this.payments = [...this.payments];
          this.success = 'Pagamento atualizado com sucesso!';
          setTimeout(() => (this.success = ''), 2500);
        }
      }
    });
  }

  delete(row: Payment) {
    if (!row.id) return;
    this.service.delete(row.id).subscribe({
      next: () => {
        this.success = 'Pagamento excluído com sucesso!';
        this.load();
        setTimeout(() => (this.success = ''), 2500);
      },
      error: () => {
        this.error = 'Falha ao excluir pagamento.';
        setTimeout(() => (this.error = ''), 3500);
      }
    });
  }

  new() {
    const ref = this.dialog.open(NewPaymentDialogComponent, { width: '640px' });
    ref.afterClosed().subscribe(created => {
      if (created) {
        this.allPayments = [created as any, ...this.allPayments];
        this.applyFilter();
        this.success = 'Pagamento criado com sucesso!';
        setTimeout(() => (this.success = ''), 2500);
      }
    });
  }
  goBack() {
    // tenta histórico, se não volta para menu
    if (window?.history?.length && document?.referrer) {
      this.location.back();
    } else {
      this.router.navigate(['/menu']);
    }
  }

  prev() { if (this.page > 0) this.page--; }
  next() { if (this.page + 1 < this.totalPages) this.page++; }
}
