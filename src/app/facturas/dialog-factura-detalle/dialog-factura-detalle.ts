import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FacturaResponseDTO } from '../../../Service/factura-service';

@Component({
  selector: 'app-dialog-factura-detalle',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog-factura-detalle.html',
  styleUrl: './dialog-factura-detalle.scss',
})
export class DialogFacturaDetalle {
  constructor(
    public dialogRef: MatDialogRef<DialogFacturaDetalle>,
    @Inject(MAT_DIALOG_DATA) public factura: FacturaResponseDTO,
  ) {}

  letraComprobante(tipo: number): string {
    return tipo === 1 ? 'A' : tipo === 11 ? 'C' : 'B';
  }

  numeroComprobanteFormateado(): string {
    const pto = String(this.factura.puntoDeVenta).padStart(4, '0');
    const nro = String(this.factura.numeroComprobante).padStart(8, '0');
    return `${pto}-${nro}`;
  }

  reimprimir() {
    // Se delega al componente padre: cierra devolviendo la acción solicitada.
    this.dialogRef.close('reimprimir');
  }
}
