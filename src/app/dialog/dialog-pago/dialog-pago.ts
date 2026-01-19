
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { MetodoDePagoService } from '../../../Service/metodo-de-pago-service';
import { MetodoPagoDTO } from '../../../interfaces/MetodoDePagoDTO/MetodoPagoDTO';

@Component({
  selector: 'app-dialog-pago',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dialog-pago.html',
  styleUrl: './dialog-pago.scss'
})
export class DialogPago implements OnInit {

  metodos: MetodoPagoDTO[] = [];
  metodoSeleccionadoId: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<DialogPago>,
    private metodoPagoService: MetodoDePagoService
  ) { }

  ngOnInit(): void {
    this.metodoPagoService.obtenerActivos().subscribe({
      next: res => this.metodos = res,
      error: err => {
        console.error('Error al cargar métodos de pago', err);
        Swal.fire('Error', 'No se pudieron cargar los métodos de pago', 'error');
        this.dialogRef.close(null);
      }
    });
  }

  seleccionarPago(id: number): void {
    this.metodoSeleccionadoId = id;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  async onConfirm(): Promise<void> {
    if (!this.metodoSeleccionadoId) return;

    await Swal.fire({
      title: '¡Pago registrado! 🎉',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3f51b5'
    });

    this.dialogRef.close(this.metodoSeleccionadoId);
  }
}
