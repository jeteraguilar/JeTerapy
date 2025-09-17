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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewPatientDialogComponent } from '../new-patient-dialog/new-patient-dialog.component';
import { EditPatientDialogComponent } from '../edit-patient-dialog/edit-patient-dialog.component';
import { ConfirmDeleteDialogComponent } from '../../../shared/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatProgressSpinnerModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientList implements OnInit {
  displayedColumns = ['name','email','phone','notes','actions'];
  patients: Patient[] = [];
  loading = true;
  error = '';
  success = '';
  page = 0;
  size = 10;
  total = 0;
  totalPages = 0;
  q = '';
  // combo options for names and the current selection
  nameOptions: string[] = [];
  selectedName: string = '';
  private platformId = inject(PLATFORM_ID);

  constructor(private patientService: PatientService, private router: Router, private location: Location, private dialog: MatDialog) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
      // load up to 200 names for the combo (saved options)
      this.patientService.getPatients(200).subscribe({
        next: (list) => {
          this.nameOptions = Array.from(new Set((list || []).map(x => x.name).filter((n): n is string => !!n)))
            .sort((a,b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
        },
        error: () => {
          // silently ignore; options will fallback to current page
        }
      });
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
        // build unique, sorted name options from current page
        this.nameOptions = Array.from(new Set((this.patients || []).map(x => x.name).filter((n): n is string => !!n)))
          .sort((a,b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar pacientes';
        this.loading = false;
      }
    });
  }

  search() { this.page = 0; this.load(); }

  onNameChange(value: string) {
    // selecting a name sets the query and triggers search; empty resets
    this.selectedName = value || '';
    this.q = this.selectedName;
    this.search();
  }

  delete(p: Patient) {
    if (!p.id) return;
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, { data: {
      title: 'Excluir Paciente',
      message: `Tem certeza que deseja excluir "${p.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir'
    }});
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.patientService.deletePatient(p.id!).subscribe({
        next: () => {
          this.patients = this.patients.filter(x => x.id !== p.id);
          this.total = Math.max(0, this.total - 1);
          if (this.patients.length === 0 && this.page > 0) { this.page--; this.load(); }
          this.success = 'Paciente excluído com sucesso!';
          setTimeout(() => { this.success = ''; }, 2500);
        },
        error: () => { this.error = 'Falha ao excluir paciente.'; setTimeout(() => (this.error = ''), 3500); }
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
        this.success = 'Paciente criado com sucesso!';
        setTimeout(() => { this.success = ''; }, 2500);
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
        this.success = 'Paciente atualizado com sucesso!';
        setTimeout(() => { this.success = ''; }, 2500);
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

// Removed local confirm dialog in favor of shared ConfirmDeleteDialogComponent
