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
import { PatientSummaryDialogComponent, PatientSummaryData } from '../patient-summary-dialog/patient-summary-dialog.component';
import { formatPhoneDisplay as utilFormatPhoneDisplay, normalizePhoneDigits } from '../../../core/util/phone.util';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatProgressSpinnerModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientList implements OnInit {
  displayedColumns = ['name','email','phone','contractType','notes','actions'];
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
  // Template de mensagem WhatsApp: {firstName} será substituído
  whatsappMessageTemplate = 'Olá {firstName}, tudo bem?';
  preferWhatsAppDesktop = true; // futuro: pode virar configuração do usuário
  private whatsappDesktopAvailable: boolean | null = null; // null = desconhecido

  constructor(private patientService: PatientService, private router: Router, private location: Location, private dialog: MatDialog) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Carrega cache de disponibilidade do desktop (true/false) se já testado antes
      try {
        const cached = localStorage.getItem('whatsappDesktopAvailable');
        if (cached === 'true') this.whatsappDesktopAvailable = true;
        if (cached === 'false') this.whatsappDesktopAvailable = false;
      } catch {}
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
  openSummary(patient: Patient) {
    if (!patient.id) return;
    const ref = this.dialog.open(PatientSummaryDialogComponent, { width: '600px', data: patient as PatientSummaryData });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const idx = this.patients.findIndex(p => p.id === result.id);
        if (idx !== -1) {
          this.patients[idx].name = result.name;
          if (result.contractType) this.patients[idx].contractType = result.contractType;
          this.patients = [...this.patients];
        }
        this.success = 'Paciente atualizado com sucesso!';
        setTimeout(() => { this.success = ''; }, 2500);
      }
    });
  }
  openEmail(email: string | undefined) {
    if (!email) return;
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${email}`;
    }
  }
  formatPhoneDigits(phone?: string): string { return normalizePhoneDigits(phone); }
  phoneDisplay(phone?: string): string { return utilFormatPhoneDisplay(phone); }
  openWhatsApp(phone?: string) {
    const digits = this.formatPhoneDigits(phone);
    if (!digits) return;
    const url = `https://wa.me/${digits}`; // open chat
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
  // Build a WhatsApp Web URL with inferred country code and optional pre-filled message
  buildWhatsAppLink(p: Patient): string {
    const raw = p.phone || '';
    const digits = this.formatPhoneDigits(raw);
    if (!digits) return '';
    // Infer country code: if user already stored with 55... keep; if 10/11 digits assume BR (55)
    // If user typed +1 originally (not persisted here) we would have only 11 digits starting with 1; treat as US only if explicit plus was present earlier (can't detect reliably now) -> default to BR unless length 11 and first two are not plausible DDD.
    let international = digits;
    if (/^55\d{10,11}$/.test(digits)) {
      international = digits; // already has 55
    } else if (digits.length === 10 || digits.length === 11) {
      // Prepend Brazil country code
      international = '55' + digits;
    }
  const firstName = (p.name || '').trim().split(/\s+/)[0];
  const message = this.whatsappMessageTemplate.replace('{firstName}', firstName || '');
    const encoded = encodeURIComponent(message);
    return `https://web.whatsapp.com/send?phone=${international}&text=${encoded}`;
  }

  // Tenta abrir via aplicativo desktop (protocol handler). Se falhar, fallback automático pelo próprio <a href> web.
  openWhatsAppDesktop(ev: MouseEvent, p: Patient) {
    if (!this.preferWhatsAppDesktop) return; // deixa o link normal funcionar
    // Se já sabemos que não está disponível, não tenta de novo; deixa o link web seguir
    if (this.whatsappDesktopAvailable === false) return;
    const link = this.buildWhatsAppLink(p);
    const raw = p.phone || '';
    const digits = this.formatPhoneDigits(raw);
    if (!digits) return;
    // Monta número internacional (mesma lógica do buildWhatsAppLink)
    let intl = digits;
    if (/^55\d{10,11}$/.test(digits)) { intl = digits; }
    else if (digits.length === 10 || digits.length === 11) { intl = '55' + digits; }
    const firstName = (p.name || '').trim().split(/\s+/)[0];
    const message = this.whatsappMessageTemplate.replace('{firstName}', firstName || '');
    const encodedMsg = encodeURIComponent(message);
    const desktopUrl = `whatsapp://send?phone=${intl}&text=${encodedMsg}`;
    try {
      // Previne navegação padrão para permitir tentativa de protocolo
      ev.preventDefault();
      // Abrir protocolo
      window.location.href = desktopUrl;
      const start = Date.now();
      // Monitor: se após timeout ainda visível -> provavelmente não abriu app
      setTimeout(() => {
        const elapsed = Date.now() - start;
        if (document.visibilityState === 'visible') {
          // Marca indisponível (cache) e faz fallback web
            this.whatsappDesktopAvailable = false;
            try { localStorage.setItem('whatsappDesktopAvailable', 'false'); } catch {}
            window.open(link, '_blank');
        } else {
          // Provavelmente foco mudou (app abriu) => marca disponível
          this.whatsappDesktopAvailable = true;
          try { localStorage.setItem('whatsappDesktopAvailable', 'true'); } catch {}
        }
      }, 1300);
    } catch {
      // Qualquer erro: fallback imediato
      window.open(link, '_blank');
      this.whatsappDesktopAvailable = false;
      try { localStorage.setItem('whatsappDesktopAvailable', 'false'); } catch {}
    }
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
