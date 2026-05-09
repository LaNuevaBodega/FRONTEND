import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ProductDetail } from '../product-detail/product-detail';
import { ProductList } from '../product-list/product-list';
import { ProductoDTO } from '../../interfaces/ProductoDTO';

import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../Service/producto-service';
import { DialogProducto } from '../dialog/dialog-producto/dialog-producto';
import { StockService } from '../../Service/stock-service';
import Swal from 'sweetalert2';
import { DialogAjusteStock } from '../dialog/dialog-ajuste-stock/dialog-ajuste-stock';

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


  @ViewChild(ProductList) productList!: ProductList;

  productoSeleccionado: ProductoDTO | null = null;
  private subCambio?: Subscription;

  triggerRefrescar = 0;

  constructor(
    private dialog: MatDialog,
    private service: ProductoService,
    private stockService: StockService,

  ) { }


  onEditar(prod: ProductoDTO) {

    this.service.obtenerPorId(prod.id).subscribe(prodCompleto => {

      const dialogRef = this.dialog.open(DialogProducto, {
        data: prodCompleto
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) return;

        this.service.actualizar(prod.id, result).subscribe({
          next: (actualizarProducto) => {

            this.productoSeleccionado = actualizarProducto;
            this.refrescarLista();

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Producto actualizado',
              showConfirmButton: false,
              timer: 1200,
              timerProgressBar: true,
              background: '#ffffff',
              color: '#1f2937',
              iconColor: '#16a34a'
            });
          },
          error: () => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Error al actualizar',
              showConfirmButton: false,
              timer: 2000,
              background: '#ffffff',
              color: '#1f2937',
              iconColor: '#dc2626'
            });
          }
        });

      });

    });
  }


  onEliminar(prod: ProductoDTO) {
    Swal.fire({
      title: '¿Desea eliminar este producto?',
      text: prod.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(result => {
      if (!result.isConfirmed) return;

      this.service.eliminar(prod.id).subscribe({
        next: () => {
          this.productoSeleccionado = null;
          this.refrescarLista();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Producto eliminado',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#16a34a'
          });
        },
        error: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Error al eliminar',
            showConfirmButton: false,
            timer: 2000,
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#dc2626'
          });
        }
      });
    });
  }
  
  onAgregar() {
    const dialogRef = this.dialog.open(DialogProducto, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.service.crear(result).subscribe({
        next: (nuevoProducto) => {

          this.productoSeleccionado = nuevoProducto;

          this.refrescarLista();


          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Producto creado',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#16a34a'
          });
        }
      });

    });
  }

  abrirAjuste(producto: ProductoDTO) {
    const dialogRef = this.dialog.open(DialogAjusteStock, {
      data: producto
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.stockService.ajustar(producto.id, result).subscribe({

        next: (productoActualizado) => {


          this.productoSeleccionado = productoActualizado;

          this.refrescarLista();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Stock ajustado correctamente',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true,
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#16a34a'
          });
        },
        error: () => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Error al ajustar stock',
            showConfirmButton: false,
            timer: 2000,
            background: '#ffffff',
            color: '#1f2937',
            iconColor: '#dc2626'
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.subCambio?.unsubscribe();
  }

  onProductoSeleccionado(prod: ProductoDTO | null) {
    this.productoSeleccionado = prod;
  }

  onExportarBalanza(): void {
    this.service.obtenerGranel().subscribe(productos => {
      const granel = productos;

      if (granel.length === 0) {
        Swal.fire('Sin productos', 'No hay productos a granel con PLU configurado.', 'info');
        return;
      }

      const v = (val: any) => (val === null || val === undefined || val === '') ? '""' : String(val);

      const lineas = granel.map(p => {
        const precio = Math.round(p.precioVenta);
        const cols = [
          'PanaderiaDLH', // 0  Sección
          p.codigoPLU,    // 1  Número de PLU
          p.nombre,       // 2  Descripción
          p.codigoPLU,    // 3  Código de PLU
          precio,         // 4  Precio Lista 1
          '0,00',         // 5  Tara
          'Peso     ',    // 6  Tipo de Venta (espacios requeridos por Qendra)
          0,              // 7
          '',             // 8  Vencimiento
          0,              // 9
          0,              // 10
          '',             // 11
          '',             // 12
          '',             // 13
          'N',            // 14
          '0,0',          // 15
          0, 0,           // 16-17
          '',             // 18
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 19-28
          'G',            // 29 Origen
          '', '', '',     // 30-32
          precio,         // 33 Precio promoción
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 34-47
        ];
        return cols.map(c => v(c)).join(';');
      });

      const bom = '﻿';
      const csv = bom + lineas.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ImportarBalanza.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  refrescarLista() {
    this.triggerRefrescar++;
  }

}
