import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FacturaResponseDTO, FacturaService } from '../../Service/factura-service';
import { TicketServiceArca } from '../../Service/ticket-service-arca';
import { DialogFacturaDetalle } from './dialog-factura-detalle/dialog-factura-detalle';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './facturas.html',
  styleUrl: './facturas.scss',
})
export class Facturas implements OnInit, OnDestroy {

  desde!: Date;
  hasta!: Date;
  busqueda = '';

  // El filtrado es client-side sobre todo el dataset ya cargado; el debounce evita
  // recorrer miles de filas en cada tecla.
  private filtro$ = new Subject<string>();
  private filtroSub?: Subscription;

  cargando = false;

  dataSource = new MatTableDataSource<FacturaResponseDTO>([]);

  columns = ['fecha', 'comprobante', 'cliente', 'total', 'cae', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private facturaService: FacturaService,
    private ticketServiceArca: TicketServiceArca,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.desde = hoy;
    this.hasta = hoy;

    // Filtra por razón social del cliente o número de comprobante (texto ya armado en el row).
    this.dataSource.filterPredicate = (f, filtro) => {
      const texto = (
        f.clienteRazonSocial + ' ' +
        this.numeroComprobante(f) + ' ' +
        f.tipoComprobanteNombre
      ).toLowerCase();
      return texto.includes(filtro);
    };

    this.filtroSub = this.filtro$
      .pipe(debounceTime(250))
      .subscribe(() => this.aplicarFiltro());

    this.buscar();
  }

  ngOnDestroy(): void {
    this.filtroSub?.unsubscribe();
  }

  buscar(): void {
    if (!this.desde || !this.hasta) return;

    const toLocalISO = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 19);
    };

    const desdeISO = toLocalISO(new Date(this.desde));
    const hastaISO = toLocalISO(new Date(this.hasta));

    this.cargando = true;
    this.facturaService.listar(desdeISO, hastaISO).subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: err => {
        console.error('Error al obtener facturas:', err);
        this.cargando = false;
      },
    });
  }

  // Emite al subject; el filtro real se aplica con debounce (ver ngOnInit).
  onBusquedaChange(): void {
    this.filtro$.next(this.busqueda);
  }

  aplicarFiltro(): void {
    this.dataSource.filter = (this.busqueda || '').trim().toLowerCase();
  }

  // Comprobante en formato fiscal: PtoVenta(4) - Número(8). Ej: 0010-00000074.
  numeroComprobante(f: FacturaResponseDTO): string {
    const pto = String(f.puntoDeVenta).padStart(4, '0');
    const nro = String(f.numeroComprobante).padStart(8, '0');
    return `${pto}-${nro}`;
  }

  letra(f: FacturaResponseDTO): string {
    return f.tipoComprobante === 1 ? 'A' : f.tipoComprobante === 11 ? 'C' : 'B';
  }

  verDetalle(f: FacturaResponseDTO): void {
    const ref = this.dialog.open(DialogFacturaDetalle, { data: f, autoFocus: false });
    ref.afterClosed().subscribe(accion => {
      if (accion === 'reimprimir') this.reimprimir(f);
    });
  }

  // Reimprime el ticket fiscal (CAE + QR) reconstruyendo la venta desde el snapshot de la factura.
  async reimprimir(f: FacturaResponseDTO): Promise<void> {
    const venta = {
      total: f.total,
      detalles: f.detalles.map(d => ({
        cantidad: d.cantidad,
        productoNombre: d.nombreProducto,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    };
    const html = await this.ticketServiceArca.generarHtmlFactura(f, venta);
    this.ticketServiceArca.imprimir(html);
  }
}
