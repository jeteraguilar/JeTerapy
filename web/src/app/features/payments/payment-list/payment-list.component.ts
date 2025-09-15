import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PaymentService, Payment } from '../../../core/services/payment';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent {
  displayedColumns = ['appointment', 'amount', 'status', 'dueDate', 'actions'];
  payments: Payment[] = [];

  constructor(private service: PaymentService, private router: Router, private location: Location) {
    this.load();
  }

  load() {
    this.service.list().subscribe((data) => (this.payments = data));
  }

  edit(row: Payment) {
    if (!row.id) return;
    this.router.navigate(['/payments', row.id, 'edit']);
  }

  delete(row: Payment) {
    if (!row.id) return;
    this.service.delete(row.id).subscribe(() => this.load());
  }

  new() { this.router.navigate(['/payments/new']); }
  goBack() {
    // tenta histórico, se não volta para menu
    if (window?.history?.length && document?.referrer) {
      this.location.back();
    } else {
      this.router.navigate(['/menu']);
    }
  }
}
