import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
// Módulos de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

// SweetAlert2
import Swal from 'sweetalert2'; 
import { ProveedorService } from '../../Service/proveedor-service';
import { ProveedorDTO } from '../../interfaces/ProveedorDTO';
import { DialogProveedor } from '../dialog/dialog-proveedor/dialog-proveedor';
import { CrearProveedorDTO } from '../../interfaces/CrearProveedorDTO';

// Importaciones de DTOs y Servicios (Ajusta rutas si es necesario)


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
    private dialog: MatDialog
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
        Swal.fire('Error de Carga', 'No se pudieron obtener los proveedores.', 'error');
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
        Swal.fire(titulo, 'El proveedor se guardó correctamente.', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Ocurrió un error en la operación de guardado.';
        Swal.fire('Error', errorMsg, 'error');
      }
    });
  }
  
  eliminarProveedor(id: number, nombre: string): void {
    Swal.fire({
      title: `¿Eliminar Proveedor: ${nombre}?`,
      text: "¡Esta acción no se puede revertir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proveedorService.eliminar(id).subscribe({
          next: () => {
            this.cargarProveedores();
            Swal.fire('Eliminado', `El proveedor ${nombre} ha sido eliminado.`, 'success');
          },
          error: (err) => {
            const errorMsg = err.error?.error || 'No se pudo eliminar el proveedor.';
            Swal.fire('Error', errorMsg, 'error');
          }
        });
      }
    });
  }
}