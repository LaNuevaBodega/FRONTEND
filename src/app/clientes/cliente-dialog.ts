import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CondicionIvaService } from '../../Service/condicioniva-service';
import { CondicionIvaDTO } from '../../interfaces/CondicionIvaDTO';
import { ClienteDTO } from '../../interfaces/ClienteDTO';

export interface ClienteDialogData {
  cliente?: ClienteDTO;
}

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './cliente-dialog.html',
})
export class ClienteDialog implements OnInit {
  form!: FormGroup;
  condiciones: CondicionIvaDTO[] = [];
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClienteDialog>,
    private condicionIvaService: CondicionIvaService,
    @Inject(MAT_DIALOG_DATA) public data: ClienteDialogData,
  ) {}

  ngOnInit() {
    this.esEdicion = !!this.data?.cliente;
    this.form = this.fb.group({
      razonSocial: [this.data?.cliente?.razonSocial ?? '', Validators.required],
      cuit: [this.data?.cliente?.cuit ?? ''],
      domicilio: [this.data?.cliente?.domicilio ?? ''],
      email: [this.data?.cliente?.email ?? '', Validators.email],
      condicionIvaId: [this.data?.cliente?.condicionIvaId ?? null, Validators.required],
    });

    this.condicionIvaService.obtenerTodos().subscribe({
      next: lista => this.condiciones = lista,
    });
  }

  guardar() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.dialogRef.close({
      razonSocial: v.razonSocial,
      cuit: v.cuit || null,
      domicilio: v.domicilio || null,
      email: v.email || null,
      condicionIvaId: v.condicionIvaId,
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
