import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { NotificationService } from '../../Service/notification-service';
import { DialogConfirm } from '../dialog/dialog-confirm/dialog-confirm';
import { ProveedorService } from '../../Service/proveedor-service';
import { ProveedorDTO } from '../../interfaces/ProveedorDTO';
import { DialogProveedor } from '../dialog/dialog-proveedor/dialog-proveedor';
import { CrearProveedorDTO } from '../../interfaces/CrearProveedorDTO';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,

  ],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss'
})
export class Proveedores implements OnInit {
  

  constructor(
    private proveedorService: ProveedorService,
    private dialog: MatDialog,
    private notif: NotificationService,
  ) {}

  proveedores: ProveedorDTO[] = [];
  columnasMostradas: string[] = ['id', 'nombre', 'cuit', 'acciones'];

  ngOnInit(): void {
    this.cargarProveedores();
  }


  cargarProveedores(): void {
    this.proveedorService.obtenerTodos().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.notif.error('No se pudieron obtener los proveedores.');
      }
    });
  }



  abrirDialogo(proveedor?: ProveedorDTO): void {
    const dialogoRef = this.dialog.open(DialogProveedor, {      
      data: proveedor 
    });

    dialogoRef.afterClosed().subscribe((resultado: CrearProveedorDTO | undefined) => {
      if (resultado) {
        this.procesarResultado(resultado, proveedor);
      }
    });
  }

  procesarResultado(data: CrearProveedorDTO, proveedorExistente?: ProveedorDTO): void {
    let obs: Observable<ProveedorDTO>;
    let titulo: string;

    if (proveedorExistente) {      
      obs = this.proveedorService.editar(proveedorExistente.id, data);
      titulo = '¡Actualización Exitosa!';
    } else {
 
      obs = this.proveedorService.crear(data);
      titulo = '¡Creación Exitosa!';
    }

    obs.subscribe({
      next: () => {
        this.cargarProveedores();
        this.notif.success(titulo);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Ocurrió un error en la operación de guardado.';
        this.notif.error(errorMsg);
      }
    });
  }
  
  eliminarProveedor(id: number, nombre: string): void {
    this.dialog.open(DialogConfirm, {
      data: {
        title: `¿Eliminar proveedor ${nombre}?`,
        message: 'Esta acción no se puede revertir.',
        confirmText: 'Eliminar',
        variant: 'danger',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.proveedorService.eliminar(id).subscribe({
        next: () => {
          this.cargarProveedores();
          this.notif.success(`Proveedor ${nombre} eliminado`);
        },
        error: (err) => {
          const errorMsg = err.error?.error || 'No se pudo eliminar el proveedor.';
          this.notif.error(errorMsg);
        }
      });
    });
  }
}