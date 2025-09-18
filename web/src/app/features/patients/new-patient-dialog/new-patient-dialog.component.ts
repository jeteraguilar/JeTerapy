import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PatientService, Patient } from '../../../core/services/patient';
import { formatPhoneDisplay, normalizePhoneDigits, validatePhone } from '../../../core/util/phone.util';

@Component({
  selector: 'app-new-patient-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './new-patient-dialog.component.html',
  styleUrls: ['./new-patient-dialog.component.scss']
})
export class NewPatientDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NewPatientDialogComponent>);
  private service = inject(PatientService);

  loading = false;
  error = '';
  success = '';

  form!: FormGroup;

  constructor() {
    // Initialize form after validators are bound
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: ['', [this.phoneValidator]],
      contractType: ['INDIVIDUAL'],
      notes: ['']
    });
    // Name: allow spaces and only capitalize on blur (to avoid interfering while typing)
    // We'll bind (blur) in template to apply title case once the user finishes typing
    // Phone formatting/masking
    this.form.get('phone')!.valueChanges.subscribe((val: string) => {
      if (typeof val !== 'string') return;
      const digits = normalizePhoneDigits(val);
      const formatted = formatPhoneDisplay(digits);
      if (val !== formatted) this.form.get('phone')!.setValue(formatted, { emitEvent: false });
    });
  }

  toTitleCase(v: string): string {
    const lowerWords = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di']);
    return v
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((w, i) => {
        if (i > 0 && lowerWords.has(w)) return w;
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  }

  onNameBlur() {
    const ctrl = this.form.get('name');
    if (!ctrl) return;
    const v = String(ctrl.value || '');
    const t = this.toTitleCase(v);
    if (t !== v) ctrl.setValue(t, { emitEvent: false });
  }

  // Live-capitalize the first letter and letters after spaces while typing
  onNameInput(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const original = input.value || '';
    // Only adjust if needed to avoid constant churn
    const parts = original.split(/(\s+)/); // keep spaces as tokens
    for (let i = 0; i < parts.length; i++) {
      const token = parts[i];
      if (!token || /^\s+$/.test(token)) continue; // spaces
      const lowerWords = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di']);
      const w = token;
      const prevNonSpaceIndex = (() => {
        for (let j = i - 1; j >= 0; j--) { if (!/^\s+$/.test(parts[j])) return j; }
        return -1;
      })();
      const isFirstWord = prevNonSpaceIndex === -1;
      const lw = w.toLowerCase();
      if (!isFirstWord && lowerWords.has(lw)) {
        parts[i] = lw; // keep lower for connector words
      } else {
        parts[i] = lw.charAt(0).toUpperCase() + lw.slice(1);
      }
    }
    const next = parts.join('');
    if (next !== original) {
      const pos = input.selectionStart ?? next.length;
      this.form.get('name')!.setValue(next, { emitEvent: false });
      // Restore caret position as best effort
      queueMicrotask(() => {
        try { input.setSelectionRange(pos, pos); } catch {}
      });
    }
  }

  private isPhoneValid(val: string): boolean { return validatePhone(val); }

  phoneValidator = (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value || '');
    const digits = v.replace(/\D+/g, '');
    if (!digits) return null; // optional field
    return digits.length === 10 || digits.length === 11 ? null : { phone: true };
  };

  isPhoneInvalid(): boolean {
    const c = this.form.get('phone');
    if (!c) return false;
    return !!(c.touched && c.invalid);
  }

  submit() {
    this.error = '';
    this.success = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Preencha os campos corretamente para continuar.';
      return;
    }
    // Apply title case once before submit
    const nameCtrl = this.form.get('name')!;
    if (nameCtrl.value) {
      const fixed = this.toTitleCase(String(nameCtrl.value));
      if (fixed !== nameCtrl.value) nameCtrl.setValue(fixed, { emitEvent: false });
    }
    const raw = this.form.getRawValue();
    if (raw.phone && !this.isPhoneValid(raw.phone)) {
      this.error = 'Informe um telefone válido (ex.: (11) 99876-5432, (11) 2345-6789, (415) 555-1212, +1 (305) 555-7788).';
      return;
    }
    const payload = {
      name: raw.name?.trim(),
      email: raw.email?.trim() || undefined,
  phone: raw.phone ? normalizePhoneDigits(raw.phone) : undefined, // envia só dígitos
      notes: raw.notes?.trim() || undefined,
      contractType: raw.contractType || 'INDIVIDUAL'
    };
    this.loading = true;
    this.service.addPatient(payload).subscribe({
      next: (created: Patient) => {
        this.loading = false;
        this.success = 'Paciente salvo com sucesso!';
        setTimeout(() => this.dialogRef.close(created), 1200);
      },
      error: (err: any) => {
        this.loading = false;
        const msg = err?.error?.message || 'Não foi possível salvar. Tente novamente.';
        this.error = msg;
      }
    });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
