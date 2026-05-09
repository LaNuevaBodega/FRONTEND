import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { MetodoDePagoService } from '../../../Service/metodo-de-pago-service';
import { MetodoPagoDTO } from '../../../interfaces/MetodoDePagoDTO/MetodoPagoDTO';
import { FormsModule } from '@angular/forms';
import { PagoTemporal } from '../../../interfaces/Ventas/PagoTemporal';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClienteService } from '../../../Service/cliente-service';
import { ClienteDTO } from '../../../interfaces/ClienteDTO';

export interface ResultadoPago {
  pagos: { metodoPagoId: number; monto: number }[];
  imprimirTicket: boolean;
  ticketFiscal: boolean;
  clienteId: number | null;
}

@Component({
  selector: 'app-dialog-pago',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  templateUrl: './dialog-pago.html',
  styleUrl: './dialog-pago.scss'
})
export class DialogPago implements OnInit {

  // ── Paso 1: selección de método de pago ──
  metodos: MetodoPagoDTO[] = [];
  pagosSeleccionados: PagoTemporal[] = [];
  sumaPagos: number = 0;
  restante: number = 0;
  modoMix: boolean = false;

  // ── Paso 2: opciones de comprobante ──
  paso: 1 | 2 = 1;
  pagosConfirmados: { metodoPagoId: number; monto: number }[] = [];
  imprimirTicket: boolean = true;
  ticketFiscal: boolean = false;
  clienteSeleccionado: ClienteDTO | null = null;
  clientes: ClienteDTO[] = [];
  filtroBusqueda: string = '';
  cargandoClientes: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<DialogPago>,
    private metodoPagoService: MetodoDePagoService,
    private clienteService: ClienteService,
    @Inject(MAT_DIALOG_DATA) public data: { total: number }
  ) {
    this.restante = data.total;
  }

  ngOnInit(): void {
    this.metodoPagoService.obtenerActivos().subscribe({
      next: res => { this.metodos = res; },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los métodos de pago', 'error');
        this.dialogRef.close(null);
      }
    });
  }

  // ── Paso 1: lógica de pagos ──

  onCancel(): void {
    this.dialogRef.close(null);
  }

  agregarPago(metodo: MetodoPagoDTO): void {
    this.pagosSeleccionados.push({ metodoPagoId: metodo.id, nombreMetodo: metodo.nombre, monto: 0 });
  }

  quitarPago(index: number): void {
    this.pagosSeleccionados.splice(index, 1);
    this.validarTotales();
  }

  validarTotales(): void {
    this.sumaPagos = this.pagosSeleccionados.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    this.restante = Number((this.data.total - this.sumaPagos).toFixed(2));
    if (this.restante < 0) this.restante = 0;
  }

  activarMix(): void {
    if (this.pagosSeleccionados.length === 0 && this.metodos.length > 0) {
      this.pagosSeleccionados.push({
        metodoPagoId: this.metodos[0].id,
        nombreMetodo: this.metodos[0].nombre,
        monto: this.data.total
      });
      this.validarTotales();
    }
  }

  pagoRapido(metodo: MetodoPagoDTO): void {
    this.pagosConfirmados = [{ metodoPagoId: metodo.id, monto: Number(this.data.total.toFixed(2)) }];
    this.paso = 2;
  }

  async onConfirm(): Promise<void> {
    if (this.restante !== 0) {
      Swal.fire({ icon: 'warning', title: 'Pago incompleto', text: 'El total de los pagos debe coincidir con el total de la venta.' });
      return;
    }
    this.pagosConfirmados = this.pagosSeleccionados.map(p => ({
      metodoPagoId: p.metodoPagoId,
      monto: Number(p.monto)
    }));
    this.paso = 2;
  }

  // ── Paso 2: opciones de comprobante ──

  onToggleFiscal(): void {
    if (this.ticketFiscal && this.clientes.length === 0) {
      this.cargandoClientes = true;
      this.clienteService.obtenerTodos().subscribe({
        next: res => { this.clientes = res; this.cargandoClientes = false; },
        error: () => {
          this.cargandoClientes = false;
          Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
        }
      });
    }
    if (!this.ticketFiscal) {
      this.clienteSeleccionado = null;
      this.filtroBusqueda = '';
    }
  }

  get clientesFiltrados(): ClienteDTO[] {
    const t = this.filtroBusqueda.trim().toLowerCase();
    if (!t) return this.clientes.slice(0, 50);
    return this.clientes.filter(c =>
      c.razonSocial.toLowerCase().includes(t) || (c.cuit ?? '').includes(t)
    );
  }

  seleccionarCliente(cliente: ClienteDTO): void {
    this.clienteSeleccionado = cliente;
    this.filtroBusqueda = cliente.razonSocial;
  }

  volverPaso1(): void {
    this.paso = 1;
    this.pagosConfirmados = [];
  }

  confirmarFinal(): void {
    if (this.ticketFiscal && !this.clienteSeleccionado) {
      Swal.fire('Atención', 'Seleccione un cliente para la factura electrónica.', 'warning');
      return;
    }
    const resultado: ResultadoPago = {
      pagos: this.pagosConfirmados,
      imprimirTicket: this.imprimirTicket,
      ticketFiscal: this.ticketFiscal,
      clienteId: this.clienteSeleccionado?.id ?? null
    };
    this.dialogRef.close(resultado);
  }

  get resumenPagos(): string {
    if (this.pagosConfirmados.length === 1) {
      const m = this.metodos.find(x => x.id === this.pagosConfirmados[0].metodoPagoId);
      return m?.nombre ?? 'Efectivo';
    }
    return 'Pago mixto';
  }
}
