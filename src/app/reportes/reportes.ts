import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ReporteService } from '../../Service/reporte-service';
import { AuthService } from '../../Service/auth-service';
import {
  ReporteResumenDTO,
  ProductoVendidoDTO,
  CajeroReporteDTO,
} from '../../interfaces/Reportes/ReporteResumenDTO';

interface MetodoSlice {
  metodo: string;
  total: number;
  cantidad: number;
  porcentaje: number;
  color: string;
  // dasharray/offset para el donut SVG
  dash: number;
  offset: number;
}

interface HoraBar {
  hora: number;
  etiqueta: string;
  total: number;
  cantidad: number;
  altura: number;
  esMax: boolean;
  esMin: boolean;
}

interface DiaBar {
  fecha: string;
  etiqueta: string;
  total: number;
  cantidad: number;
  altura: number;
  esMax: boolean;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {

  fechaDesde: Date = this.haceDias(6);
  fechaHasta: Date = new Date();
  cargando = false;

  esAdmin = false;

  // KPIs
  totalDia = 0;
  cantidadVentas = 0;
  ticketPromedio = 0;

  // Métodos de pago (torta + listado)
  metodos: MetodoSlice[] = [];
  metodoMasUtilizado: string | null = null;

  // Productos más vendidos
  productos: ProductoVendidoDTO[] = [];
  maxCantidadProducto = 0;

  // Ventas por hora (barras)
  horas: HoraBar[] = [];
  picoMax: HoraBar | null = null;
  picoMin: HoraBar | null = null;

  // Tendencia diaria (barras)
  dias: DiaBar[] = [];

  // Ranking por cajero (solo admin)
  cajeros: CajeroReporteDTO[] = [];

  // Geometría del donut
  readonly radio = 70;
  readonly circunferencia = 2 * Math.PI * 70;

  private readonly paleta = [
    '#7b1a1f', '#b8893a', '#1f7a4d', '#29577a',
    '#b6791a', '#5d1318', '#8a93a0', '#6e171c',
  ];

  constructor(
    private reporteService: ReporteService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.isAdmin;
    this.cargar();
  }

  cargar(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;

    const usuario = this.esAdmin ? null : this.authService.userName;
    const maquina = this.esAdmin ? null : this.authService.maquinaId;

    this.cargando = true;
    this.reporteService
      .obtenerResumen(
        this.toLocalISO(this.fechaDesde),
        this.toLocalISO(this.fechaHasta),
        10,
        usuario,
        maquina,
      )
      .subscribe({
        next: (r) => {
          this.procesar(r);
          this.cargando = false;
        },
        error: () => {
          this.limpiar();
          this.cargando = false;
        },
      });
  }

  private procesar(r: ReporteResumenDTO): void {
    this.totalDia = r.totalVendido ?? 0;
    this.cantidadVentas = r.cantidadVentas ?? 0;
    this.ticketPromedio = r.ticketPromedio ?? 0;
    this.metodoMasUtilizado = r.metodoMasUtilizado ?? null;

    this.productos = r.productosMasVendidos ?? [];
    this.maxCantidadProducto = this.productos.reduce(
      (m, p) => Math.max(m, p.cantidadVendida ?? 0), 0);

    this.cajeros = r.ventasPorCajero ?? [];

    this.calcularMetodos(r);
    this.calcularHoras(r);
    this.calcularDias(r);
  }

  private calcularMetodos(r: ReporteResumenDTO): void {
    const lista = r.metodosDePago ?? [];
    let offset = 0;
    this.metodos = lista.map((m, i) => {
      const dash = (m.porcentaje / 100) * this.circunferencia;
      const slice: MetodoSlice = {
        metodo: m.metodo,
        total: m.total,
        cantidad: m.cantidad,
        porcentaje: m.porcentaje,
        color: this.paleta[i % this.paleta.length],
        dash,
        offset: -offset,
      };
      offset += dash;
      return slice;
    });
  }

  private calcularHoras(r: ReporteResumenDTO): void {
    this.horas = [];
    this.picoMax = null;
    this.picoMin = null;

    const datos = r.ventasPorHora ?? [];
    if (!datos.length) return;

    const minHora = Math.min(...datos.map((d) => d.hora));
    const maxHora = Math.max(...datos.map((d) => d.hora));
    const mapa = new Map(datos.map((d) => [d.hora, d]));

    const rango: HoraBar[] = [];
    for (let h = minHora; h <= maxHora; h++) {
      const e = mapa.get(h);
      rango.push({
        hora: h,
        etiqueta: `${h.toString().padStart(2, '0')}h`,
        total: e?.total ?? 0,
        cantidad: e?.cantidad ?? 0,
        altura: 0,
        esMax: false,
        esMin: false,
      });
    }

    const totalMaximo = Math.max(...rango.map((b) => b.total));
    for (const b of rango) {
      b.altura = totalMaximo > 0 ? Math.max((b.total / totalMaximo) * 100, b.total > 0 ? 4 : 0) : 0;
    }

    const conVentas = rango.filter((b) => b.cantidad > 0);
    this.picoMax = conVentas.reduce((a, b) => (b.total > a.total ? b : a), conVentas[0]);
    this.picoMin = conVentas.reduce((a, b) => (b.total < a.total ? b : a), conVentas[0]);
    if (this.picoMax) this.picoMax.esMax = true;
    if (this.picoMin && this.picoMin !== this.picoMax) this.picoMin.esMin = true;

    this.horas = rango;
  }

  private calcularDias(r: ReporteResumenDTO): void {
    const datos = r.ventasPorDia ?? [];
    if (!datos.length) {
      this.dias = [];
      return;
    }

    const totalMaximo = Math.max(...datos.map((d) => d.total));
    this.dias = datos.map((d) => ({
      fecha: d.fecha,
      etiqueta: this.etiquetaDia(d.fecha),
      total: d.total,
      cantidad: d.cantidad,
      altura: totalMaximo > 0 ? Math.max((d.total / totalMaximo) * 100, d.total > 0 ? 4 : 0) : 0,
      esMax: d.total === totalMaximo && totalMaximo > 0,
    }));
  }

  private limpiar(): void {
    this.totalDia = 0;
    this.cantidadVentas = 0;
    this.ticketPromedio = 0;
    this.metodoMasUtilizado = null;
    this.metodos = [];
    this.productos = [];
    this.maxCantidadProducto = 0;
    this.cajeros = [];
    this.horas = [];
    this.dias = [];
    this.picoMax = null;
    this.picoMin = null;
  }

  anchoProducto(p: ProductoVendidoDTO): number {
    return this.maxCantidadProducto > 0
      ? Math.max((p.cantidadVendida / this.maxCantidadProducto) * 100, 4)
      : 0;
  }

  money(n: number): string {
    return '$ ' + (n ?? 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Formato compacto para etiquetas con poco espacio (centro del donut, barras):
  // $ 9,8 M / $ 950 k / $ 750. Evita que montos grandes desborden el espacio.
  compacto(n: number): string {
    const v = n ?? 0;
    const abs = Math.abs(v);
    if (abs >= 1_000_000) {
      return '$ ' + (v / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' M';
    }
    if (abs >= 10_000) {
      return '$ ' + (v / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + ' k';
    }
    return '$ ' + v.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }

  cantidad(n: number): string {
    return (n ?? 0).toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  }

  private haceDias(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  private etiquetaDia(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  private toLocalISO(d: Date): string {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 19);
  }
}
