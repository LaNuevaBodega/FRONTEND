import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../Service/caja-service';
import { AuthService } from '../../Service/auth-service';
import { TicketService } from '../../Service/ticket-service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-caja-historial',
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
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './caja-historial.html',
  styleUrl: './caja-historial.scss',
})
export class CajaHistorial implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  cargando = false;

  desde!: Date;
  hasta!: Date;

  maquinas: string[] = [];
  maquinaSeleccionada: string | null = null;

  // Filtro por cierre de caja (cajaId). null = "Todos los cierres".
  cierreSeleccionado: number | null = null;
  cierres: CierreOpcion[] = [];

  // Totales exactos del cierre filtrado (los mismos del ticket impreso).
  ticketSeleccionado: any = null;

  // Derivados de los movimientos cargados, para el agrupado visual.
  private subtotalesPorCaja = new Map<number, SubtotalCaja>();
  private ordenCajas = new Map<number, number>();

  esAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get columns(): string[] {
    const base = ['fecha', 'tipo', 'descripcion', 'ingreso', 'egreso', 'saldo', 'acciones'];
    return this.esAdmin && !this.maquinaSeleccionada ? ['maquina', ...base] : base;
  }

  constructor(
    private cajaService: CajaService,
    private authService: AuthService,
    private ticketService: TicketService,
  ) { }

  ngOnInit() {
    this.esAdmin = this.authService.isAdmin;
    this.setearFechasPorDefecto();

    // El filtro por cierre es client-side sobre lo ya cargado: el filtro guarda el cajaId.
    this.dataSource.filterPredicate = (m: any, filtro: string) => String(m.cajaId) === filtro;

    if (this.esAdmin) {
      this.cargarMaquinas();
    } else {
      this.cargarCajaVendedor();
    }
  }

  private setearFechasPorDefecto() {
    const hoy = new Date();
    this.desde = hoy;
    this.hasta = hoy;
  }

  private cargarMaquinas() {
    this.cajaService.obtenerMaquinas().subscribe({
      next: maquinas => {
        this.maquinas = maquinas;
        this.buscar();
      },
      error: () => { }
    });
  }

  private cargarCajaVendedor() {
    this.cajaService.obtenerCajaAbierta().subscribe({
      next: () => this.buscar(),
      error: () => this.buscar(),
    });
  }

  reimprimir(m: any) {
    this.cajaService.obtenerTicketCierre(m.cajaId).subscribe({
      next: ticket => {
        const html = this.ticketService.generarHtmlCierre(ticket);
        this.ticketService.imprimir(html);
      },
      error: err => console.error('Error al obtener ticket de cierre', err)
    });
  }

  buscar() {
    if (!this.desde || !this.hasta) return;

    const toLocalISO = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 19);
    };

    const desdeISO = toLocalISO(new Date(this.desde));
    const hastaISO = toLocalISO(new Date(this.hasta));

    this.cargando = true;

    const request$ = this.esAdmin
      ? this.cajaService.obtenerHistorialAdmin(this.maquinaSeleccionada, desdeISO, hastaISO)
      : this.cajaService.obtenerHistorialPorMaquina(desdeISO, hastaISO);

    request$.subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.construirCierres(data);
        // Cada nueva búsqueda vuelve a "Todos los cierres".
        this.cierreSeleccionado = null;
        this.ticketSeleccionado = null;
        this.dataSource.filter = '';
        this.cargando = false;
      },
      error: err => {
        console.error('Error al obtener historial:', err);
        this.cargando = false;
      }
    });
  }

  // A partir de los movimientos cargados arma: el orden de cada sesión (para el color alterno),
  // los subtotales por caja (ventas/retiros) y la lista de cierres para el desplegable.
  private construirCierres(data: any[]): void {
    this.subtotalesPorCaja.clear();
    this.ordenCajas.clear();
    const cierres: CierreOpcion[] = [];
    let orden = 0;

    for (const m of data) {
      if (!this.ordenCajas.has(m.cajaId)) this.ordenCajas.set(m.cajaId, orden++);

      if (!this.subtotalesPorCaja.has(m.cajaId))
        this.subtotalesPorCaja.set(m.cajaId, { apertura: 0, ventas: 0, retiros: 0 });
      const s = this.subtotalesPorCaja.get(m.cajaId)!;
      if (m.tipo === 'APERTURA') s.apertura += m.monto;
      else if (m.tipo === 'VENTA') s.ventas += m.monto;
      else if (m.tipo === 'RETIRO') s.retiros += m.monto; // ya viene negativo

      // El saldo del CIERRE = caja final (el cierre suma monto 0): sirve de etiqueta.
      if (m.tipo === 'CIERRE') {
        cierres.push({
          cajaId: m.cajaId,
          maquinaId: m.maquinaId ?? null,
          fecha: m.fecha,
          montoFinal: m.saldo,
          label: this.etiquetaCierre(m.maquinaId, m.fecha, m.saldo),
        });
      }
    }

    this.cierres = cierres;
  }

  private etiquetaCierre(maquinaId: string | null, fecha: string, montoFinal: number): string {
    const f = new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
    const maq = maquinaId ? `${maquinaId} · ` : '';
    const monto = (montoFinal ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    return `${maq}${f} · ${monto}`;
  }

  // Para las ventas mostramos "puesto-númerocompleto" (ej 0010-00000074) en vez de "Venta #74":
  // el puesto sale de la máquina del movimiento (o la del cajero logueado) y el número se rellena a 8 dígitos.
  descripcionMostrar(m: any): string {
    if (m?.tipo === 'VENTA') {
      const match = /(\d+)/.exec(m.descripcion ?? '');
      if (match) {
        const puestoRaw = m.maquinaId || this.authService.maquinaId || '';
        const puesto = /^\d+$/.test(puestoRaw) ? puestoRaw.padStart(4, '0') : puestoRaw;
        const nro = match[1].padStart(8, '0');
        return puesto ? `${puesto}-${nro}` : `Venta ${nro}`;
      }
    }
    return m?.descripcion ?? '';
  }

  // Verde para ingresos (apertura, ventas), rojo para egresos (retiros). Cierre/neutro sin color.
  claseTipo(m: any): string {
    if (m?.monto > 0) return 'ingreso';
    if (m?.monto < 0) return 'egreso';
    return '';
  }

  // Al elegir un cierre se filtra la tabla a esa sesión y se traen sus totales exactos
  // (los del ticket). "Todos" (null) limpia el filtro y vuelve a la vista agrupada.
  onCierreChange(): void {
    if (this.cierreSeleccionado == null) {
      this.dataSource.filter = '';
      this.ticketSeleccionado = null;
      return;
    }
    this.dataSource.filter = String(this.cierreSeleccionado);
    this.cajaService.obtenerTicketCierre(this.cierreSeleccionado).subscribe({
      next: ticket => this.ticketSeleccionado = ticket,
      error: () => this.ticketSeleccionado = null,
    });
  }

  reimprimirSeleccionado(): void {
    if (this.cierreSeleccionado != null) this.reimprimir({ cajaId: this.cierreSeleccionado });
  }

  // Clases de fila: color alterno por sesión (cajaId) y resaltado de la fila de CIERRE.
  // Solo aplica en la vista "Todos"; al filtrar un cierre puntual no hace falta diferenciar.
  claseFila(m: any): Record<string, boolean> {
    const agrupar = this.cierreSeleccionado == null;
    const idx = this.ordenCajas.get(m.cajaId) ?? 0;
    return {
      'sesion-alt': agrupar && idx % 2 === 1,
      'fila-cierre': m.tipo === 'CIERRE',
    };
  }

  // Texto de subtotal que se muestra inline sobre la fila (resaltada) de CIERRE.
  subtotalCierre(m: any): string {
    const s = this.subtotalesPorCaja.get(m.cajaId);
    if (!s) return 'Cierre de caja';
    const fmt = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    return `Cierre · Ventas ${fmt(s.ventas)} · Retiros ${fmt(s.retiros)}`;
  }
}

interface CierreOpcion {
  cajaId: number;
  maquinaId: string | null;
  fecha: string;
  montoFinal: number;
  label: string;
}

interface SubtotalCaja {
  apertura: number;
  ventas: number;
  retiros: number;
}
