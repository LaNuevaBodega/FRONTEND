import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuditoriaService } from '../../Service/auditoria-service';
import { AuditoriaDTO } from '../../interfaces/AuditoriaDTO/AuditoriaDTO';

interface CambioCampo {
  campo: string;
  antes: any;
  despues: any;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria implements OnInit {

  desde: Date | null = null;
  hasta: Date | null = null;

  // El rango por defecto es la última semana: hasta = hoy, desde = 7 días antes.
  private readonly hoy = new Date();
  entidadFiltro: string = '';
  accionFiltro: string = '';
  usuarioFiltro: string = '';

  entidades: string[] = [];
  acciones = ['Alta', 'Baja', 'Modificacion'];

  registros: AuditoriaDTO[] = [];
  total = 0;
  pagina = 1;
  pageSize = 50;

  cargando = false;
  expandido: number | null = null;

  columns = ['fecha', 'usuarioNombre', 'maquinaId', 'entidad', 'entidadId', 'accion', 'detalle'];

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.hasta = new Date(this.hoy);
    this.desde = new Date(this.hoy);
    this.desde.setDate(this.desde.getDate() - 7);

    this.auditoriaService.entidades().subscribe(e => (this.entidades = e));
    this.buscar();
  }

  buscar(resetPagina = true) {
    if (resetPagina) this.pagina = 1;

    const toLocalISO = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 19);
    };

    // "desde" arranca a las 00:00 y "hasta" termina a las 23:59:59 del día elegido,
    // así el rango es inclusivo en ambos extremos.
    const inicioDia = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
    const finDia = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

    this.cargando = true;
    this.auditoriaService.consultar({
      entidad: this.entidadFiltro || null,
      accion: this.accionFiltro || null,
      usuario: this.usuarioFiltro || null,
      desde: this.desde ? toLocalISO(inicioDia(this.desde)) : null,
      hasta: this.hasta ? toLocalISO(finDia(this.hasta)) : null,
      pagina: this.pagina,
      pageSize: this.pageSize,
    }).subscribe({
      next: r => {
        this.registros = r.items;
        this.total = r.total;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  limpiar() {
    this.desde = null;
    this.hasta = null;
    this.entidadFiltro = '';
    this.accionFiltro = '';
    this.usuarioFiltro = '';
    this.buscar();
  }

  onPage(e: PageEvent) {
    this.pagina = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.buscar(false);
  }

  toggle(id: number) {
    this.expandido = this.expandido === id ? null : id;
  }

  // Construye la lista de campos cambiados (antes/después) para una fila.
  cambios(r: AuditoriaDTO): CambioCampo[] {
    const antes = this.parse(r.valoresAnteriores);
    const despues = this.parse(r.valoresNuevos);
    const claves = new Set([...Object.keys(antes), ...Object.keys(despues)]);

    return Array.from(claves).map(campo => ({
      campo,
      antes: antes[campo],
      despues: despues[campo],
    }));
  }

  private parse(json: string | null): Record<string, any> {
    if (!json) return {};
    try { return JSON.parse(json); } catch { return {}; }
  }

  mostrarValor(v: any): string {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
  }

  claseAccion(accion: string): string {
    switch (accion) {
      case 'Alta': return 'badge badge--alta';
      case 'Baja': return 'badge badge--baja';
      case 'Modificacion': return 'badge badge--mod';
      default: return 'badge';
    }
  }
}
