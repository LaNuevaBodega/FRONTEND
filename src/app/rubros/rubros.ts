import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import { NotificationService } from '../../Service/notification-service';
import { DialogConfirm } from '../dialog/dialog-confirm/dialog-confirm';
import { RubroService } from '../../Service/rubro-service';
import { RubroDTO } from '../../interfaces/RubroDTO';
import { DialogRubro } from '../dialog/dialog-rubro/dialog-rubro';
import { CrearRubroDTO } from '../../interfaces/CrearRubroDTO';

@Component({
  selector: 'app-rubros',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './rubros.html', 
  styleUrl: './rubros.scss'    
})
export class Rubros implements OnInit {
    
  constructor(
    private rubroService: RubroService,
    private dialog: MatDialog,
    private notif: NotificationService,
  ) {}

  rubros: RubroDTO[] = [];
  columnasMostradas: string[] = ['id', 'nombre', 'acciones'];

  ngOnInit(): void {
    this.cargarRubros();
  }  

  cargarRubros(): void {
    this.rubroService.obtenerTodos().subscribe({
      next: (data) => {
        this.rubros = data;
      },
      error: (err) => {
        console.error('Error al cargar rubros:', err);
        this.notif.error('No se pudieron obtener los rubros.');
      }
    });
  }
  

  abrirDialogo(rubro?: RubroDTO): void {    
    const dialogoRef = this.dialog.open(DialogRubro, {      
      data: rubro, 
      
    });

    dialogoRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.procesarResultado(resultado, rubro);
      }
    });
  }

  procesarResultado(data: CrearRubroDTO, rubroExistente?: RubroDTO): void {
    let obs;
    let titulo: string;

    if (rubroExistente) {
  
      obs = this.rubroService.editar(rubroExistente.id, data);
      titulo = '¡Actualización Exitosa!';
    } else {      
      obs = this.rubroService.crear(data);
      titulo = '¡Creación Exitosa!';
    }

    obs.subscribe({
      next: () => {
        this.cargarRubros();
        this.notif.success(titulo);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Ocurrió un error en la operación de guardado.';
        this.notif.error(errorMsg);
      }
    });
  }
  
  eliminarRubro(id: number, nombre: string): void {
    this.dialog.open(DialogConfirm, {
      data: {
        title: `¿Eliminar ${nombre}?`,
        message: 'Esta acción no se puede revertir.',
        confirmText: 'Eliminar',
        variant: 'danger',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.rubroService.eliminar(id).subscribe({
        next: () => {
          this.cargarRubros();
          this.notif.success(`Rubro ${nombre} eliminado`);
        },
        error: (err) => {
          const errorMsg = err.error?.error || 'No se pudo eliminar el rubro.';
          this.notif.error(errorMsg);
        }
      });
    });
  }
}