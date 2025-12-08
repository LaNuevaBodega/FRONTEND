import { Component, OnDestroy } from '@angular/core';
import { ProductDetail } from '../product-detail/product-detail';
import { ProductList } from '../product-list/product-list';
import { ProductoDTO } from '../../interfaces/ProductoDTO';

import { Subscription } from 'rxjs';
import { RealtimeChange, SignalRService } from '../../Service/SignalRService';
import { MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../Service/producto-service';
import { DialogProducto } from '../dialog/dialog-producto/dialog-producto';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [
    ProductDetail,
    ProductList
  ],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.scss'
})
export class ProductosPage implements OnDestroy {

  productoSeleccionado: ProductoDTO | null = null;
  private subCambio?: Subscription;

  constructor(private signalR: SignalRService,
    private dialog: MatDialog,
    private service: ProductoService

  ) {


    this.subCambio = this.signalR
      .cambiosDeEntidad('producto')
      .subscribe((cambio: RealtimeChange<any>) => {

        if (!this.productoSeleccionado) return;

        if (
          cambio.accion === 'actualizado' &&
          cambio.payload.id === this.productoSeleccionado?.id
        ) {
          this.productoSeleccionado = {
            ...this.productoSeleccionado,
            ...cambio.payload
          };
        }

        if (
          cambio.accion === 'eliminado' &&
          cambio.payload.id === this.productoSeleccionado?.id
        ) {
          this.productoSeleccionado = null;
        }
      });
  }


  onEditar(prod: ProductoDTO) {
    const dialogRef = this.dialog.open(DialogProducto, {
      width: '600px',
      data: prod
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.actualizar(prod.id, result).subscribe();
    });
  }

  onEliminar(prod: ProductoDTO) {
    if (!confirm(`Eliminar producto "${prod.nombre}"?`)) return;

    this.service.eliminar(prod.id).subscribe(() => {
      this.productoSeleccionado = null;
    });
  }

  onAgregar() {
    const dialogRef = this.dialog.open(DialogProducto, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.crear(result).subscribe();
    });
  }


  ngOnDestroy(): void {
    this.subCambio?.unsubscribe();
  }

  onProductoSeleccionado(prod: ProductoDTO | null) {
    this.productoSeleccionado = prod;
  }
}
