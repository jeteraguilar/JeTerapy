import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<mat-card><h2>Pagamentos</h2></mat-card>`
})
export class PaymentsComponent {}
