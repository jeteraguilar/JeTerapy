import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="img-wrapper" [class.loaded]="loaded()" [style.width.px]="width" [style.height.px]="height">
      <div class="spinner" *ngIf="!loaded()">
        <div class="dot1"></div><div class="dot2"></div><div class="dot3"></div>
      </div>
      <img *ngIf="src" [src]="src" [alt]="alt || ''" (load)="onLoad()" (error)="onError()" [style.object-fit]="objectFit" />
    </div>
  `,
  styleUrls: ['./image-loader.component.scss']
})
export class ImageLoaderComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() width = 160;
  @Input() height = 80;
  @Input() objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' = 'contain';

  private _loaded = signal(false);
  private _error = signal(false);
  loaded = this._loaded;
  error = this._error;

  onLoad() { this._loaded.set(true); }
  onError() { this._error.set(true); }
}
