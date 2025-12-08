import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { Observable } from 'rxjs';
import { RubroDTO } from '../../../interfaces/RubroDTO';
import { ProveedorDTO } from '../../../interfaces/ProveedorDTO';
import { ProductoDTO } from '../../../interfaces/ProductoDTO';
import { RubroService } from '../../../Service/rubro-service';
import { ProveedorService } from '../../../Service/proveedor-service';
import { CreacionProductoDTO } from '../../../interfaces/CreacionProductoDTO';
import { EdicionProductoDTO } from '../../../interfaces/EdicionProductoDTO';

@Component({
  selector: 'app-dialog-producto',
  imports: [

    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule ,    
  ],
  templateUrl: './dialog-producto.html',
  styleUrl: './dialog-producto.scss'
})
export class DialogProducto implements OnInit {
  
  productoForm!: FormGroup;
  rubros$!: Observable<RubroDTO[]>;
  proveedores$!: Observable<ProveedorDTO[]>;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogProducto>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoDTO | undefined,    
    private rubroService: RubroService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();      
    
    const idRubroInicial = (this.data as any)?.idRubro || 0;
    const idProveedorInicial = (this.data as any)?.idProveedor || 0;

    this.productoForm = this.fb.group({
      codigo: [this.data?.codigo || '', Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      precioCosto: [this.data?.precioCosto || 0, [Validators.required, Validators.min(0.01)]],  
      precioVenta: [this.data?.precioVenta || 0, [Validators.required, Validators.min(0.01)]],
      idProveedor: [idProveedorInicial, [Validators.required, Validators.min(1)]],
      idRubro: [idRubroInicial, [Validators.required, Validators.min(1)]]
    });

      this.rubros$.subscribe(rubros => {
    const rubroSeleccionado = rubros.find(r => r.nombre === this.data?.rubroNombre);
    if (rubroSeleccionado) {
      this.productoForm.patchValue({ idRubro: rubroSeleccionado.id });
    }
  });

  this.proveedores$.subscribe(proveedores => {
    const proveedorSeleccionado = proveedores.find(p => p.nombre === this.data?.proveedorNombre);
    if (proveedorSeleccionado) {
      this.productoForm.patchValue({ idProveedor: proveedorSeleccionado.id });
    }
  });
  }

  cargarDatosIniciales(): void {    
    this.rubros$ = this.rubroService.obtenerTodos();
    this.proveedores$ = this.proveedorService.obtenerTodos();
  }

  guardar(): void {
    if (this.productoForm.valid) {
      const formValue = this.productoForm.value;
      
      if (this.data) {        
        const edicionDto: EdicionProductoDTO = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          precioCosto: formValue.precioCosto,
          precioVenta: formValue.precioVenta,
          idProveedor: formValue.idProveedor,
          idRubro: formValue.idRubro,
        };
        this.dialogRef.close(edicionDto);
      } else {        
        const creacionDto: CreacionProductoDTO = formValue;
        this.dialogRef.close(creacionDto);
      }
    }
  }

}
