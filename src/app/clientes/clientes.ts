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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClienteService } from '../../Service/cliente-service';
import { ClienteDTO, EditarClienteDTO } from '../../interfaces/ClienteDTO';
import { ClienteDialog } from './cliente-dialog';
import { NotificationService } from '../../Service/notification-service';
import { DialogConfirm } from '../dialog/dialog-confirm/dialog-confirm';

@Component({
  selector: 'app-clientes',
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
    MatDialogModule,
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes implements OnInit {
  dataSource = new MatTableDataSource<ClienteDTO>([]);
  columnas = ['razonSocial', 'cuit', 'condicionIva', 'claseComprobante', 'acciones'];
  cargando = false;
  searchVisible = false;
  filtro = '';

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private notif: NotificationService,
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data, filter) => {
      const f = filter.toLowerCase();
      return (
        data.razonSocial.toLowerCase().includes(f) ||
        (data.cuit ?? '').toLowerCase().includes(f)
      );
    };
    this.cargar();
  }

  private cargar() {
    this.cargando = true;
    this.clienteService.obtenerTodos().subscribe({
      next: clientes => {
        this.dataSource.data = clientes;
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

  abrirCrear() {
    const ref = this.dialog.open(ClienteDialog, { width: '480px', data: {} });
    ref.afterClosed().subscribe(dto => {
      if (!dto) return;
      this.clienteService.crear(dto).subscribe({
        next: nuevo => {
          this.dataSource.data = [...this.dataSource.data, nuevo];
          this.notif.success('Cliente creado');
        },
        error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo crear el cliente'),
      });
    });
  }

  abrirEditar(cliente: ClienteDTO) {
    const ref = this.dialog.open(ClienteDialog, { width: '480px', data: { cliente } });
    ref.afterClosed().subscribe((dto: EditarClienteDTO | undefined) => {
      if (!dto) return;
      this.clienteService.actualizar(cliente.id, dto).subscribe({
        next: actualizado => {
          const data = [...this.dataSource.data];
          data[data.findIndex(c => c.id === cliente.id)] = actualizado;
          this.dataSource.data = data;
          this.notif.success('Cliente actualizado');
        },
        error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo actualizar el cliente'),
      });
    });
  }

  eliminar(cliente: ClienteDTO) {
    this.dialog.open(DialogConfirm, {
      data: {
        title: '¿Eliminar cliente?',
        message: `${cliente.razonSocial} será eliminado definitivamente.`,
        confirmText: 'Eliminar',
        variant: 'danger',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.clienteService.eliminar(cliente.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(c => c.id !== cliente.id);
          this.notif.success('Cliente eliminado');
        },
        error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo eliminar el cliente'),
      });
    });
  }
}
