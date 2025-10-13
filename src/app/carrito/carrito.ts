// carrito.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { CarritoItem } from '../../interfaces/CarritoItem';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { DialogPago } from '../dialog/dialog-pago/dialog-pago';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']

})
export class Carrito {
  
   carrito: CarritoItem[] = [];

   constructor(private dialog: MatDialog){

   }

  
  agregarProducto(producto: ProductoDTO) {
    const item = this.carrito.find(i => i.producto.id === producto.id);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }


  aumentarCantidad(item: CarritoItem) {
    item.cantidad++;
  }

  
  disminuirCantidad(item: CarritoItem) {
    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      this.eliminarProducto(item);
    }
  }

  
  eliminarProducto(item: CarritoItem) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

    abrirDialogoPago(): void {
    const dialogRef = this.dialog.open(DialogPago, {
      width: '650px', // Ancho que definimos para el grid de 3 columnas
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Método de pago seleccionado: ${result}`);
        // Aquí iría la lógica para procesar el pago o abrir el siguiente formulario.
      } else {
        console.log('Selección de pago cancelada.');
      }
    });
  }
  
  get total() {
    return this.carrito.reduce((sum, i) => sum + i.producto.precioVenta * i.cantidad, 0);
  }

}
