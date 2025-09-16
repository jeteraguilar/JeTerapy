import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PatientService, Patient, Page } from '../../../core/services/patient';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewPatientDialogComponent } from '../new-patient-dialog/new-patient-dialog.component';
import { EditPatientDialogComponent } from '../edit-patient-dialog/edit-patient-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, EditPatientDialogComponent],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientList implements OnInit {
  displayedColumns = ['name','email','phone','notes','actions'];
  patients: Patient[] = [];
  loading = true;
  error = '';
  page = 0;
  size = 10;
  total = 0;
  totalPages = 0;
  q = '';
  private platformId = inject(PLATFORM_ID);

  constructor(private patientService: PatientService, private router: Router, private location: Location, private dialog: MatDialog) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    } else {
      this.loading = false; // evita spinner infinito no SSR
    }
  }

  load() {
    this.loading = true;
    this.patientService.list({ q: this.q || undefined, page: this.page, size: this.size }).subscribe({
      next: (p: Page<Patient>) => {
        this.patients = p.content;
        this.total = p.totalElements;
        this.totalPages = p.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar pacientes';
        this.loading = false;
      }
    });
  }

  search() { this.page = 0; this.load(); }

  delete(p: Patient) {
    if (!p.id) return;
    const ref = this.dialog.open(ConfirmDeleteDialog, { data: { name: p.name } });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.patientService.deletePatient(p.id!).subscribe({
        next: () => {
          this.patients = this.patients.filter(x => x.id !== p.id);
          this.total = Math.max(0, this.total - 1);
          if (this.patients.length === 0 && this.page > 0) { this.page--; this.load(); }
        },
        error: () => { alert('Falha ao excluir paciente.'); }
      });
    });
  }

  next() { this.page++; this.load(); }
  prev() { if (this.page > 0) { this.page--; this.load(); } }

  newPatient() {
    const ref = this.dialog.open(NewPatientDialogComponent, { width: '640px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        // Inserir no início e manter ordenação local simples
        this.patients = [result, ...this.patients].sort((a,b) => (a.name||'').localeCompare(b.name||'', 'pt-BR', { sensitivity: 'base' }));
        this.total++;
      }
    });
  }
  edit(patient: Patient) {
    if (!patient.id) return;
    const ref = this.dialog.open(EditPatientDialogComponent, { width: '640px', data: patient });
    ref.afterClosed().subscribe(result => {
      if (result) {
        // Atualiza o paciente na lista local
        const idx = this.patients.findIndex(p => p.id === result.id);
        if (idx !== -1) {
          this.patients[idx] = result;
          this.patients = [...this.patients]; // trigger change detection
        }
      }
    });
  }
  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/menu']);
    }
  }
}

// Simple confirm delete dialog
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component as NgComponent } from '@angular/core';

@NgComponent({
  selector: 'confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Excluir paciente</h2>
    <div mat-dialog-content>Tem certeza que deseja excluir "{{ data.name }}"? Esta ação não pode ser desfeita.</div>
    <div mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close="false">Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Excluir</button>
    </div>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogModule]
})
export class ConfirmDeleteDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}
