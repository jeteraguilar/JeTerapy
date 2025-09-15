import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatListModule, MatTooltipModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  items = [
    { label: 'Pacientes', link: '/patients' },
    { label: 'Atendimentos', link: '/appointments' },
    { label: 'Pagamentos', link: '/payments' }
  ];
}
