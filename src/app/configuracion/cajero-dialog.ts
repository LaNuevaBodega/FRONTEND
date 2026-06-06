import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CajeroDTO, CrearCajeroDTO, EditarCajeroDTO } from '../../interfaces/CajeroDTO/CajeroDTO';

export interface CajeroDialogData {
  cajero?: CajeroDTO;
}

export type CajeroDialogResult =
  | { modo: 'crear'; dto: CrearCajeroDTO }
  | { modo: 'editar'; dto: EditarCajeroDTO };

@Component({
  selector: 'app-cajero-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './cajero-dialog.html',
})
export class CajeroDialog implements OnInit {
  form!: FormGroup;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CajeroDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CajeroDialogData,
  ) {}

  ngOnInit() {
    this.esEdicion = !!this.data?.cajero;

    if (this.esEdicion) {
      this.form = this.fb.group({
        maquinaId: [this.data.cajero?.maquinaId ?? ''],
        activo: [this.data.cajero?.activo ?? true],
      });
    } else {
      this.form = this.fb.group({
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        maquinaId: [''],
      });
    }
  }

  guardar() {
    if (this.form.invalid) return;
    const v = this.form.value;

    if (this.esEdicion) {
      this.dialogRef.close({
        modo: 'editar',
        dto: {
          usuarioId: this.data.cajero!.id,
          maquinaId: v.maquinaId?.trim() || null,
          activo: v.activo,
        },
      } as CajeroDialogResult);
    } else {
      this.dialogRef.close({
        modo: 'crear',
        dto: {
          userName: v.userName.trim(),
          email: v.email.trim(),
          password: v.password,
          maquinaId: v.maquinaId?.trim() || null,
        },
      } as CajeroDialogResult);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
