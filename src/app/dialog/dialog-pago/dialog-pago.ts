
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

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
export class DialogPago {

  paymentOptions = [
    { name: 'EFECTIVO', label: 'EFECTIVO', icon: '💵', colorClass: 'color-green' },
    { name: 'QR', label: 'CÓDIGO QR', icon: '📱', colorClass: 'color-blue' },
    { name: 'TARJETA', label: 'TARJETA', icon: '💳', colorClass: 'color-red' }
  ];

    qrImageUrl: string = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EjemploPagoQR';


  selectedMethod: string | null = null;
  
  constructor(
    public dialogRef: MatDialogRef<DialogPago>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPago | undefined 
  ) {}

  seleccionarPago(method: string): void {
    this.selectedMethod = method;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  async onConfirm(): Promise<void> {
    if (this.selectedMethod) {
      await Swal.fire({
        title: '¡Pago Exitoso! 🎉',
        text: `Tu pago con ${this.selectedMethod} fue procesado correctamente.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3f51b5'
      });
      
      this.dialogRef.close(this.selectedMethod);
    }
  }
}
