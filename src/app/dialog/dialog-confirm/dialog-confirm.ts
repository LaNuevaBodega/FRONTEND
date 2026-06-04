import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** danger pinta el botón de confirmar en rojo (default), primary en bordó */
  variant?: 'danger' | 'primary';
}

@Component({
  selector: 'app-dialog-confirm',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm">
      <div class="confirm__head" [class.is-danger]="data.variant !== 'primary'">
        <mat-icon>{{ data.variant === 'primary' ? 'help_outline' : 'warning_amber' }}</mat-icon>
        <h3>{{ data.title }}</h3>
      </div>
      <p *ngIf="data.message" class="confirm__msg">{{ data.message }}</p>
      <div class="confirm__actions">
        <button mat-stroked-button (click)="cancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-flat-button
                [class.btn-danger]="data.variant !== 'primary'"
                [class.btn-primary]="data.variant === 'primary'"
                (click)="confirm()" cdkFocusInitial>
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 320px; }
    .confirm { padding: 20px 22px 18px; }
    .confirm__head {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      mat-icon { font-size: 26px; height: 26px; width: 26px; color: var(--lnb-primary); }
      h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--lnb-text); }
      &.is-danger mat-icon { color: var(--lnb-danger); }
    }
    .confirm__msg { color: var(--lnb-text-muted); margin: 0 0 18px; font-size: 14px; line-height: 1.45; }
    .confirm__actions {
      display: flex; justify-content: flex-end; gap: 8px;
    }
    .btn-danger {
      background: var(--lnb-danger) !important; color: #fff !important;
    }
    .btn-primary {
      background: var(--lnb-primary) !important; color: #fff !important;
    }
  `],
})
export class DialogConfirm {
  constructor(
    private ref: MatDialogRef<DialogConfirm, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmData,
  ) {}

  confirm() { this.ref.close(true); }
  cancel()  { this.ref.close(false); }
}
