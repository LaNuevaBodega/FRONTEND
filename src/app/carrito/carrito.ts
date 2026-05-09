import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoItem } from '../../interfaces/CarritoItem';
import { ProductoDTO } from '../../interfaces/ProductoDTO';
import { DialogPago, ResultadoPago } from '../dialog/dialog-pago/dialog-pago';
import { MatDialog } from '@angular/material/dialog';
import { CrearVentaDTO } from '../../interfaces/Ventas/VentaDTO/CrearVentaDTO';

export interface PedidoVenta {
  dto: CrearVentaDTO;
  imprimirTicket: boolean;
  ticketFiscal: boolean;
  clienteId: number | null;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class Carrito {

  carrito: CarritoItem[] = [];

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) { }

  @Output() confirmarVenta = new EventEmitter<PedidoVenta>();

  confirmarVentaRapida() { }

  agregarProducto(producto: ProductoDTO) {
    const item = this.carrito.find(i => i.producto.id === producto.id);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ producto: { ...producto }, cantidad: 1 });
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
    this.carrito = this.carrito.filter(i => i.producto.id !== item.producto.id);
    this.carrito = [...this.carrito];
    this.cdr.detectChanges();
  }

  get total() {
    const raw = this.carrito.reduce((sum, i) => sum + i.producto.precioVenta * i.cantidad, 0);
    return Number(raw.toFixed(2));
  }

  abrirDialogoPago(): void {
    const dialogRef = this.dialog.open(DialogPago, {
      data: { total: this.total },
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((resultado: ResultadoPago | null) => {
      if (!resultado || resultado.pagos.length === 0) return;

      const pedido: PedidoVenta = {
        dto: {
          pagos: resultado.pagos,
          detalles: this.carrito.map(item => ({
            productoId: item.producto.id,
            cantidad: item.cantidad
          }))
        },
        imprimirTicket: resultado.imprimirTicket,
        ticketFiscal: resultado.ticketFiscal,
        clienteId: resultado.clienteId
      };

      this.confirmarVenta.emit(pedido);

      this.carrito = [];
      this.cdr.detectChanges();
    });
  }

  limpiar() {
    this.carrito = [];
    this.cdr.detectChanges();
  }
}
