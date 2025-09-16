import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientService, Patient } from '../../../core/services/patient';

@Component({
  selector: 'app-edit-patient-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './edit-patient-dialog.component.html',
  styleUrls: ['./edit-patient-dialog.component.scss']
})
export class EditPatientDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditPatientDialogComponent>);
  private service = inject(PatientService);
  loading = false;
  error = '';
  success = '';
  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Patient) {
    this.form = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(2)]],
      email: [data.email, [Validators.email]],
      phone: [data.phone, [this.phoneValidator]],
      notes: [data.notes]
    });
    // Formatar valor inicial de telefone se houver (sem disparar valueChanges)
    if (data.phone) {
      const digitsInit = String(data.phone).replace(/\D+/g, '').slice(0, 11);
      const formattedInit = this.formatPhone(digitsInit);
      this.form.get('phone')!.setValue(formattedInit, { emitEvent: false });
    }
    this.form.get('phone')!.valueChanges.subscribe((val: string) => {
      if (typeof val !== 'string') return;
      const digits = (val || '').replace(/\D+/g, '').slice(0, 11);
      const formatted = this.formatPhone(digits);
      if (val !== formatted) {
        this.form.get('phone')!.setValue(formatted, { emitEvent: false });
      }
    });
  }

  ngOnInit() {}

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

  onNameInput(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const original = input.value || '';
    const parts = original.split(/(\s+)/);
    for (let i = 0; i < parts.length; i++) {
      const token = parts[i];
      if (!token || /^\s+$/.test(token)) continue;
      const lowerWords = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di']);
      const w = token;
      const prevNonSpaceIndex = (() => {
        for (let j = i - 1; j >= 0; j--) { if (!/^\s+$/.test(parts[j])) return j; }
        return -1;
      })();
      const isFirstWord = prevNonSpaceIndex === -1;
      const lw = w.toLowerCase();
      if (!isFirstWord && lowerWords.has(lw)) {
        parts[i] = lw;
      } else {
        parts[i] = lw.charAt(0).toUpperCase() + lw.slice(1);
      }
    }
    const next = parts.join('');
    if (next !== original) {
      const pos = input.selectionStart ?? next.length;
      this.form.get('name')!.setValue(next, { emitEvent: false });
      queueMicrotask(() => {
        try { input.setSelectionRange(pos, pos); } catch {}
      });
    }
  }

  private formatPhone(d: string): string {
    if (d.length <= 10) {
      return d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})\d+$/, '$1');
    } else {
      return d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1 $2')
        .replace(/(\d{4})\d+$/, '$1');
    }
  }

  private isPhoneValid(val: string): boolean {
    const digits = (val || '').replace(/\D+/g, '');
    return digits.length === 0 || digits.length === 10 || digits.length === 11;
  }

  phoneValidator = (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value || '');
    const digits = v.replace(/\D+/g, '');
    if (!digits) return null;
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
    const nameCtrl = this.form.get('name')!;
    if (nameCtrl.value) {
      const fixed = this.toTitleCase(String(nameCtrl.value));
      if (fixed !== nameCtrl.value) nameCtrl.setValue(fixed, { emitEvent: false });
    }
    const raw = this.form.getRawValue();
    if (raw.phone && !this.isPhoneValid(raw.phone)) {
      this.error = 'Informe um telefone válido (ex.: 11999999999 ou (11) 99999 9999).';
      return;
    }
    const payload = {
      id: this.data.id,
      name: raw.name?.trim(),
      email: raw.email?.trim() || undefined,
      phone: raw.phone ? raw.phone.replace(/\D+/g, '') : undefined,
      notes: raw.notes?.trim() || undefined
    };
    this.loading = true;
    this.service.updatePatient(payload.id, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      notes: payload.notes
    }).subscribe({
      next: (updated: Patient) => {
        this.loading = false;
        this.success = 'Paciente salvo com sucesso!';
        setTimeout(() => this.dialogRef.close(updated), 1200);
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
