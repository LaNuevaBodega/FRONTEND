import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RubroDTO } from '../../../interfaces/RubroDTO';
import { CrearRubroDTO } from '../../../interfaces/CrearRubroDTO';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



@Component({
  selector: 'app-dialog-rubro',
  imports: [  
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,    
    MatButtonModule,
    MatInputModule,
  
  ],
  templateUrl: './dialog-rubro.html',
  styleUrl: './dialog-rubro.scss'
})
export class DialogRubro implements OnInit {

   rubroForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogRubro>,
    @Inject(MAT_DIALOG_DATA) public data: RubroDTO | undefined 
  ) {}

  ngOnInit(): void {
    this.rubroForm = this.fb.group({
      nombre: [this.data?.nombre || '', Validators.required]
    });
  }

  guardar(): void {
    if (this.rubroForm.valid) {      
      this.dialogRef.close(this.rubroForm.value as CrearRubroDTO);
    }
  }
}
