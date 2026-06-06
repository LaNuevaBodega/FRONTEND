import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UsuariosService } from '../../Service/usuarios-service';
import { PermisosService } from '../../Service/permisos-service';
import { AuthService } from '../../Service/auth-service';
import { NotificationService } from '../../Service/notification-service';
import { CajeroDTO } from '../../interfaces/CajeroDTO/CajeroDTO';
import { PermisoVistaDTO } from '../../interfaces/PermisoDTO/PermisoVistaDTO';
import { CajeroDialog, CajeroDialogResult } from './cajero-dialog';
import { DialogConfirm } from '../dialog/dialog-confirm/dialog-confirm';

@Component({
  selector: 'app-configuracion',
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
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
  cajeros: CajeroDTO[] = [];
  columnas = ['usuario', 'email', 'maquina', 'rol', 'estado', 'acciones'];
  cargandoCajeros = false;

  permisos: PermisoVistaDTO[] = [];
  cargandoPermisos = false;
  guardandoPermisos = false;

  miMaquina = '';
  asignandoMaquina = false;

  constructor(
    private usuariosService: UsuariosService,
    private permisosService: PermisosService,
    public authService: AuthService,
    private dialog: MatDialog,
    private notif: NotificationService,
  ) {}

  ngOnInit() {
    const m = this.authService.maquinaId;
    this.miMaquina = m && m !== 'SIN-MAQUINA' ? m : '';
    this.cargarCajeros();
    this.cargarPermisos();
  }

  // ============ CAJEROS ============

  private cargarCajeros() {
    this.cargandoCajeros = true;
    this.usuariosService.obtenerTodos().subscribe({
      next: cajeros => {
        this.cajeros = cajeros;
        this.cargandoCajeros = false;
      },
      error: () => {
        this.notif.error('No se pudieron cargar los cajeros');
        this.cargandoCajeros = false;
      },
    });
  }

  abrirCrear() {
    const ref = this.dialog.open(CajeroDialog, { width: '460px', data: {} });
    ref.afterClosed().subscribe((res: CajeroDialogResult | undefined) => {
      if (!res || res.modo !== 'crear') return;
      this.usuariosService.crear(res.dto).subscribe({
        next: () => {
          this.notif.success('Cajero creado');
          this.cargarCajeros();
        },
        error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo crear el cajero'),
      });
    });
  }

  abrirEditar(cajero: CajeroDTO) {
    const ref = this.dialog.open(CajeroDialog, { width: '460px', data: { cajero } });
    ref.afterClosed().subscribe((res: CajeroDialogResult | undefined) => {
      if (!res || res.modo !== 'editar') return;
      this.usuariosService.editar(res.dto).subscribe({
        next: () => {
          this.notif.success('Cajero actualizado');
          this.cargarCajeros();
        },
        error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo actualizar el cajero'),
      });
    });
  }

  desactivar(cajero: CajeroDTO) {
    this.dialog.open(DialogConfirm, {
      data: {
        title: '¿Desactivar cajero?',
        message: `${cajero.userName} no podrá iniciar sesión hasta reactivarlo.`,
        confirmText: 'Desactivar',
        variant: 'danger',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.usuariosService.desactivar(cajero.id).subscribe({
        next: () => {
          this.notif.success('Cajero desactivado');
          this.cargarCajeros();
        },
        error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo desactivar'),
      });
    });
  }

  reactivar(cajero: CajeroDTO) {
    this.usuariosService.editar({
      usuarioId: cajero.id,
      maquinaId: cajero.maquinaId,
      activo: true,
    }).subscribe({
      next: () => {
        this.notif.success('Cajero reactivado');
        this.cargarCajeros();
      },
      error: err => this.notif.error(err.error?.mensaje ?? 'No se pudo reactivar'),
    });
  }

  // ============ PERMISOS DE EMPLEADOS ============

  private cargarPermisos() {
    this.cargandoPermisos = true;
    this.permisosService.obtener().subscribe({
      next: permisos => {
        this.permisos = permisos;
        this.cargandoPermisos = false;
      },
      error: () => {
        this.notif.error('No se pudieron cargar los permisos');
        this.cargandoPermisos = false;
      },
    });
  }

  guardarPermisos() {
    this.guardandoPermisos = true;
    const cambios = this.permisos.map(p => ({ id: p.id, habilitado: p.habilitado }));
    this.permisosService.actualizar(cambios).subscribe({
      next: () => {
        // Refrescamos la cache del servicio para que el menú lateral se actualice.
        this.permisosService.obtener().subscribe();
        this.notif.success('Permisos guardados');
        this.guardandoPermisos = false;
      },
      error: err => {
        this.notif.error(err.error?.mensaje ?? 'No se pudieron guardar los permisos');
        this.guardandoPermisos = false;
      },
    });
  }

  // ============ MI MÁQUINA (autoasignación) ============

  asignarMiMaquina() {
    const maquina = this.miMaquina.trim();
    if (!maquina) {
      this.notif.warning('Ingresá un nombre de máquina');
      return;
    }
    this.asignandoMaquina = true;
    this.usuariosService.asignarMiMaquina(maquina).subscribe({
      next: res => {
        this.authService.setToken(res.token);
        this.notif.success(`Máquina "${maquina}" asignada. Ya podés abrir caja y vender.`);
        this.asignandoMaquina = false;
        this.cargarCajeros();
      },
      error: err => {
        this.notif.error(err.error?.mensaje ?? 'No se pudo asignar la máquina');
        this.asignandoMaquina = false;
      },
    });
  }
}
