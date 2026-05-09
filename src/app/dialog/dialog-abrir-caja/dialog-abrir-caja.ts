import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-abrir-caja',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './dialog-abrir-caja.html',
  styleUrl: './dialog-abrir-caja.scss',
})
export class DialogAbrirCaja {
  montoInicial: number = 0;

  constructor(private dialogRef: MatDialogRef<DialogAbrirCaja>) {}

  confirmar() {
    if (this.montoInicial < 0) return;
    this.dialogRef.close(this.montoInicial);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
