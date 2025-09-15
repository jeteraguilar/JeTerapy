import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent {
  displayedColumns = ['patient', 'date', 'time', 'status', 'actions'];
  appointments = [
    { patient: 'Marcia Gonçalvez', date: '2025-09-02', time: '14:00', status: 'CONFIRMED' },
    { patient: 'João Silva', date: '2025-09-03', time: '09:30', status: 'SCHEDULED' }
  ];
  constructor(private router: Router, private location: Location) {}
  new() { this.router.navigate(['/appointments/new']); }
  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/menu']);
    }
  }
}
