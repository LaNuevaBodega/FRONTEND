import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductoDTO } from '../../../interfaces/ProductoDTO';

@Component({
  selector: 'app-dialog-ajuste-stock',
  imports: [    
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule  
  ],
  templateUrl: './dialog-ajuste-stock.html',
  styleUrl: './dialog-ajuste-stock.scss',
})
export class DialogAjusteStock {    
  
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAjusteStock>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoDTO
  ) {
    this.form = this.fb.group({
      cantidad: [0, Validators.required],
      motivo: ['', Validators.required]
    });
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }


}
