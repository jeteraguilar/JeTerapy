import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">{{ title }}</h2>
    <div mat-dialog-content>{{ message }}</div>
    <div mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-raised-button color="primary" class="btn-primary" [mat-dialog-close]="true">{{ confirmLabel }}</button>
    </div>
  `,
  styles: [`
    .dialog-title { margin: 0 0 4px; color: #76393B; }
    .btn-primary { background-color: #76393B !important; color: #fff !important; }
  `]
})
export class ConfirmDeleteDialogComponent {
  title = 'Confirmar exclusão';
  message = 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.';
  confirmLabel = 'Excluir';
  constructor(@Inject(MAT_DIALOG_DATA) data: { title?: string; message?: string; confirmLabel?: string }) {
    if (data?.title) this.title = data.title;
    if (data?.message) this.message = data.message;
    if (data?.confirmLabel) this.confirmLabel = data.confirmLabel;
  }
}
