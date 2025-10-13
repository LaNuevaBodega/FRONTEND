import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProveedorDTO } from '../../../interfaces/ProveedorDTO';
import { CrearProveedorDTO } from '../../../interfaces/CrearProveedorDTO';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule
  ],
  templateUrl: './dialog-proveedor.html',
  styleUrl: './dialog-proveedor.scss'
})
export class DialogProveedor implements OnInit {

  proveedorForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogProveedor>,    
    @Inject(MAT_DIALOG_DATA) public data: ProveedorDTO | undefined
  ) { }

  ngOnInit(): void {
    const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;     
    this.proveedorForm = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required],
      cuit: [this.data?.cuit || '', [Validators.pattern(cuitPattern)]] 
    });
  }

  guardar(): void {
    if (this.proveedorForm.valid) {      
      this.dialogRef.close(this.proveedorForm.value as CrearProveedorDTO);
    }
  }

}
