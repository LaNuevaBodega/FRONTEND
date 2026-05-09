import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface ResultadoRetiro {
  monto: number;
  motivo: string;
}

@Component({
  selector: 'app-dialog-retirar-dinero',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './dialog-retirar-dinero.html',
  styleUrl: './dialog-retirar-dinero.scss',
})
export class DialogRetirarDinero {
  monto: number | null = null;
  motivo: string = '';
  error: string = '';

  constructor(private dialogRef: MatDialogRef<DialogRetirarDinero>) {}

  confirmar() {
    if (!this.monto || this.monto <= 0) {
      this.error = 'Ingrese un monto válido.';
      return;
    }
    this.error = '';
    this.dialogRef.close({ monto: this.monto, motivo: this.motivo } as ResultadoRetiro);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
