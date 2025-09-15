import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService, Patient } from '../../../core/services/patient';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientForm implements OnInit {
  title = 'Novo paciente';
  model: Partial<Patient> = { name: '', email: '', phone: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PatientService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.title = 'Editar paciente';
      this.service.getPatient(id).subscribe(p => this.model = p);
    }
  }

  onSubmit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.updatePatient(id, this.model).subscribe(() => this.router.navigate(['/patients']));
    } else {
      this.service.addPatient(this.model).subscribe(() => this.router.navigate(['/patients']));
    }
  }

  onCancel() {
    this.model = { name: '', email: '', phone: '' };
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/patients']);
    }
  }
}
