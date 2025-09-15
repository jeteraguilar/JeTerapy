import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  year = new Date().getFullYear();
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (this.loading) return;
    this.errorMessage = '';
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.loading = false;
        const backendMsg = err?.error?.message || err?.error?.error || '';
        this.errorMessage = backendMsg || 'Credenciais inválidas ou servidor indisponível';
        console.warn('[AUTH] Falha login', err);
      }
    });
  }
}
