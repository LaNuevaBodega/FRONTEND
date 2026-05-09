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
        this.cargando = false;
      },
      error: err => {
        console.error('Error al obtener historial:', err);
        this.cargando = false;
      }
    });
  }
}
