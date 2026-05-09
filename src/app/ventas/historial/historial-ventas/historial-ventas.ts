import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { VentasService } from '../../../../Service/ventas-service';
import { VentaHistorialDTO } from '../../../../interfaces/Ventas/VentaDTO/VentaHistorialDTO';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../../../Service/usuarios-service';
import { CajaService } from '../../../../Service/caja-service';
import { AuthService } from '../../../../Service/auth-service';
import { TicketService } from '../../../../Service/ticket-service';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MetodoDePagoService } from '../../../../Service/metodo-de-pago-service';
import { MetodoPagoDTO } from '../../../../interfaces/MetodoDePagoDTO/MetodoPagoDTO';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatPaginatorModule,  // <-- agregar
  ],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.scss',
})
export class HistorialVentas implements OnInit {

  desde!: Date;
  hasta!: Date;

  usuarioSeleccionado: string | null = null;
  maquinaSeleccionada: string | null = null;

  usuarios: string[] = [];
  maquinas: string[] = [];

  esAdmin = false;
  cargando = false;


  // metodoPagoFiltro: string | null = null;
  metodoPagoFiltro: string = '';


  metodosDePago: MetodoPagoDTO[] = [];


  dataSource = new MatTableDataSource<VentaHistorialDTO>([]);  // <-- reemplaza ventas[]

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns: string[] = [
    'numeroVenta', 'fechaHora', 'total',
    'metodoDePago', 'usuario', 'maquinaId', 'accion'
  ];

  constructor(
    private ventasService: VentasService,
    private usuarioService: UsuariosService,
    private cajaService: CajaService,
    private authService: AuthService,
    private ticketService: TicketService,
    private metodoPagoService: MetodoDePagoService
  ) { }

  ngOnInit(): void {
    this.esAdmin = this.authService.isAdmin;

    const hoy = new Date();
    this.desde = hoy;
    this.hasta = hoy;

    if (this.esAdmin) {
      this.usuarioService.obtenerCajerosActivos().subscribe(u => {
        this.usuarios = u.map(x => x.userName);
      });
      this.cajaService.obtenerMaquinas().subscribe(m => {
        this.maquinas = m;
      });
    } else {
      this.usuarioSeleccionado = this.authService.userName;
      this.maquinaSeleccionada = this.authService.maquinaId;
    }

    this.buscar();


    this.metodoPagoService.obtenerActivos().subscribe(m => {
      this.metodosDePago = [...m, { id: -1, nombre: 'MIXTO', activo: true }];
    });

  }

  buscar() {
    if (!this.desde || !this.hasta) return;

    const toLocalISO = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 19);
    };

    const desdeStr = toLocalISO(new Date(this.desde));
    const hastaStr = toLocalISO(new Date(this.hasta));

    this.cargando = true;
    this.ventasService.obtenerHistorial(
      desdeStr, hastaStr,
      this.usuarioSeleccionado, this.maquinaSeleccionada
    ).subscribe({
      next: v => {
        let resultado = v;
        if (this.metodoPagoFiltro) {
          resultado = v.filter(x => x.metodoDePago === this.metodoPagoFiltro);
        }
        this.dataSource.data = resultado;
        this.dataSource.paginator = this.paginator;
        this.cargando = false;
      }
    });
  }


  reimprimir(id: number) {
    this.ventasService.obtenerVentaParaTicket(id).subscribe({
      next: venta => {
        const html = this.ticketService.generarHtmlVenta(venta);
        this.ticketService.imprimir(html);
      }
    });
  }

  get totalDia() {
    return this.dataSource.data.reduce((sum, v) => sum + v.total, 0);
  }

  get totalesPorMetodo() {
    const mapa: Record<string, number> = {};
    for (const v of this.dataSource.data) {
      const metodo = v.metodoDePago ?? 'N/A';
      mapa[metodo] = (mapa[metodo] ?? 0) + v.total;
    }
    return Object.entries(mapa).map(([metodo, total]) => ({ metodo, total }));
  }

}