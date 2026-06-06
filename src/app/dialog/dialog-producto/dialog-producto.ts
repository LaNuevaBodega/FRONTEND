import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { RubroDTO } from '../../../interfaces/RubroDTO';
import { ProveedorDTO } from '../../../interfaces/ProveedorDTO';
import { ProductoDTO } from '../../../interfaces/ProductoDTO';
import { RubroService } from '../../../Service/rubro-service';
import { ProveedorService } from '../../../Service/proveedor-service';
import { CreacionProductoDTO } from '../../../interfaces/CreacionProductoDTO';
import { EdicionProductoDTO } from '../../../interfaces/EdicionProductoDTO';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-dialog-producto',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './dialog-producto.html',
  styleUrl: './dialog-producto.scss'
})
export class DialogProducto implements OnInit, OnDestroy {

  productoForm!: FormGroup;

  rubrosList: RubroDTO[] = [];
  proveedoresList: ProveedorDTO[] = [];
  rubrosFiltrados = new ReplaySubject<RubroDTO[]>(1);
  proveedoresFiltrados = new ReplaySubject<ProveedorDTO[]>(1);
  rubroSearchCtrl = new FormControl('');
  proveedorSearchCtrl = new FormControl('');
  private _onDestroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogProducto>,
    @Inject(MAT_DIALOG_DATA) public data: ProductoDTO | undefined,
    private rubroService: RubroService,
    private proveedorService: ProveedorService,
  ) {}

  ngOnInit(): void {
    const idRubroInicial = (this.data as any)?.idRubro || 0;
    // El proveedor del producto viene de Movi como ProveedorCod (no como id local).
    const idProveedorInicial = this.data?.proveedorCod || 0;

    this.productoForm = this.fb.group({
      codigo: [this.data?.codigo || '', Validators.required],
      nombre: [this.data?.nombre || '', Validators.required],
      // precioCosto: [this.data?.precioCosto || 0, [Validators.required, Validators.min(0.01)]],
      precioVenta: [this.data?.precioVenta || 0, [Validators.required, Validators.min(0.01)]],
      idProveedor: [idProveedorInicial, [Validators.required, Validators.min(1)]],
      idRubro: [idRubroInicial, [Validators.required, Validators.min(1)]],
      esVendible: [this.data ? this.data.esVendible : true],
      esElaborado: [this.data?.esElaborado ?? false],
      esAGranel: [this.data?.esAGranel ?? false],
      codigoPLU: [this.data?.codigoPLU ?? null],
    });

    this.productoForm.get('esAGranel')?.valueChanges.subscribe(esAGranel => {
      this.actualizarCampoCodigoPorPlu(esAGranel);
    });

    this.productoForm.get('codigoPLU')?.valueChanges.subscribe(() => {
      if (this.productoForm.get('esAGranel')?.value) {
        this.actualizarCampoCodigoPorPlu(true);
      }
    });

    if (this.data?.esAGranel) {
      this.productoForm.get('codigo')?.disable();
    }

    this.rubroService.obtenerTodos().subscribe(rubros => {
      this.rubrosList = rubros;
      this.rubrosFiltrados.next(rubros.slice());
      const rubroSeleccionado = rubros.find(r => this.coincideNombre(r.nombre, this.data?.rubroNombre));
      if (rubroSeleccionado) {
        this.productoForm.patchValue({ idRubro: rubroSeleccionado.id });
      }
    });

    // Proveedores reales de Movi: el id de cada uno es el ProveedorCod que se
    // guarda en Stock. Así el proveedor del producto aparece preseleccionado.
    this.proveedorService.obtenerMovi().subscribe(proveedores => {
      this.proveedoresList = proveedores;
      this.proveedoresFiltrados.next(proveedores.slice());

      // Preselección por código de Movi; si no vino el código, intentamos por nombre.
      if (this.data?.proveedorCod) {
        this.productoForm.patchValue({ idProveedor: this.data.proveedorCod });
      } else {
        const proveedorSeleccionado = proveedores.find(p => this.coincideNombre(p.nombre, this.data?.proveedorNombre));
        if (proveedorSeleccionado) {
          this.productoForm.patchValue({ idProveedor: proveedorSeleccionado.id });
        }
      }
    });

    this.rubroSearchCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => this.filtrarRubros());

    this.proveedorSearchCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => this.filtrarProveedores());
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Compara dos nombres ignorando mayúsculas/minúsculas y espacios sobrantes.
   * Necesario porque los productos vienen de MoviSQL y los proveedores/rubros
   * de la base primaria, donde el mismo nombre puede diferir en formato.
   */
  private coincideNombre(a?: string | null, b?: string | null): boolean {
    if (!a || !b) return false;
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  private filtrarRubros(): void {
    const search = (this.rubroSearchCtrl.value || '').toLowerCase();
    this.rubrosFiltrados.next(
      this.rubrosList.filter(r => r.nombre.toLowerCase().includes(search))
    );
  }

  private filtrarProveedores(): void {
    const search = (this.proveedorSearchCtrl.value || '').toLowerCase();
    this.proveedoresFiltrados.next(
      this.proveedoresList.filter(p => p.nombre.toLowerCase().includes(search))
    );
  }

  private actualizarCampoCodigoPorPlu(esAGranel: boolean): void {
    const codigoCtrl = this.productoForm.get('codigo');
    if (esAGranel) {
      const plu = this.productoForm.get('codigoPLU')?.value;
      const codigoGenerado = plu ? `PLU-${String(plu).padStart(5, '0')}` : 'PLU';
      codigoCtrl?.setValue(codigoGenerado);
      codigoCtrl?.disable();
    } else {
      codigoCtrl?.enable();
      if (codigoCtrl?.value?.startsWith('PLU')) {
        codigoCtrl?.setValue('');
      }
    }
  }

  guardar(): void {
    if (this.productoForm.valid) {
      const formValue = this.productoForm.getRawValue();

      if (this.data) {
        const edicionDto: EdicionProductoDTO = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          precioCosto: formValue.precioCosto,
          precioVenta: formValue.precioVenta,
          idProveedor: formValue.idProveedor,
          idRubro: formValue.idRubro,
          esVendible: formValue.esVendible,
          esElaborado: formValue.esElaborado,
          esAGranel: formValue.esAGranel,
          codigoPLU: formValue.codigoPLU,
        };
        this.dialogRef.close(edicionDto);
      } else {
        const creacionDto: CreacionProductoDTO = formValue;
        this.dialogRef.close(creacionDto);
      }
    }
  }
}
