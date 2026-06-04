import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotifKind = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snack = inject(MatSnackBar);

  private base(kind: NotifKind, duration: number): MatSnackBarConfig {
    return {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['lnb-snack', `lnb-snack--${kind}`]
    };
  }

  success(message: string, duration = 2500) {
    this.snack.open(message, '', this.base('success', duration));
  }

  error(message: string, duration = 4500) {
    this.snack.open(message, 'Cerrar', this.base('error', duration));
  }

  warning(message: string, duration = 3500) {
    this.snack.open(message, '', this.base('warning', duration));
  }

  info(message: string, duration = 3000) {
    this.snack.open(message, '', this.base('info', duration));
  }

  show(title: string, detail: string | undefined, kind: NotifKind, duration?: number) {
    const msg = detail ? `${title} — ${detail}` : title;
    switch (kind) {
      case 'success': return this.success(msg, duration);
      case 'error':   return this.error(msg, duration);
      case 'warning': return this.warning(msg, duration);
      case 'info':    return this.info(msg, duration);
    }
  }
}
