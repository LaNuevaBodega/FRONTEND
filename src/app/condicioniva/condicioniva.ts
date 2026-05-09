import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CondicionIvaService } from '../../Service/condicioniva-service';
import { CondicionIvaDTO } from '../../interfaces/CondicionIvaDTO';

@Component({
  selector: 'app-condicioniva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './condicioniva.html',
  styleUrl: './condicioniva.scss',
})
export class Condicioniva implements OnInit {

  dataSource = new MatTableDataSource<CondicionIvaDTO>([]);
  columnas = ['id', 'nombre', 'claseComprobante'];
  cargando = false;
  searchVisible = false;
  filtro = '';

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private condicionIvaService: CondicionIvaService) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data, filter) =>
      data.nombre.toLowerCase().includes(filter.toLowerCase());
    this.cargar();
  }

  private cargar() {
    this.cargando = true;
    this.condicionIvaService.obtenerTodos().subscribe({
      next: lista => {
        this.dataSource.data = lista;
        this.cargando = false;
      },
      error: () => { this.cargando = false; },
    });
  }

  toggleSearch() {
    this.searchVisible = !this.searchVisible;
    if (this.searchVisible) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 260);
    } else {
      this.limpiarBusqueda();
    }
  }

  aplicarFiltro() {
    this.dataSource.filter = this.filtro.trim().toLowerCase();
  }

  limpiarBusqueda() {
    this.filtro = '';
    this.dataSource.filter = '';
    this.searchVisible = false;
  }
}
