import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NotificationService } from '../../../Service/notification-service';
import { MetodoDePagoService } from '../../../Service/metodo-de-pago-service';
import { MetodoPagoDTO } from '../../../interfaces/MetodoDePagoDTO/MetodoPagoDTO';
import { FormsModule } from '@angular/forms';
import { PagoTemporal } from '../../../interfaces/Ventas/PagoTemporal';
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
  pagoActivoIndex: number = -1;

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
    private notif: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: { total: number }
  ) {
    this.restante = data.total;
  }

  ngOnInit(): void {
    this.metodoPagoService.obtenerActivos().subscribe({
      next: res => { this.metodos = res; },
      error: () => {
        this.notif.error('No se pudieron cargar los métodos de pago');
        this.dialogRef.close(null);
      }
    });
  }

  // ── Paso 1: lógica de pagos ──

  onCancel(): void {
    this.dialogRef.close(null);
  }

  setModoSimple(): void {
    this.modoMix = false;
    this.pagosSeleccionados = [];
    this.pagoActivoIndex = -1;
    this.validarTotales();
  }

  setModoMixto(): void {
    this.modoMix = true;
    this.pagoActivoIndex = -1;
  }

  agregarPago(metodo: MetodoPagoDTO): void {
    if (this.pagosSeleccionados.some(p => p.metodoPagoId === metodo.id)) {
      this.notif.info(`${metodo.nombre} ya está en la lista`);
      const idx = this.pagosSeleccionados.findIndex(p => p.metodoPagoId === metodo.id);
      this.pagoActivoIndex = idx;
      return;
    }
    this.pagosSeleccionados.push({
      metodoPagoId: metodo.id,
      nombreMetodo: metodo.nombre,
      monto: 0
    });
    this.pagoActivoIndex = this.pagosSeleccionados.length - 1;
    this.validarTotales();
  }

  quitarPago(index: number): void {
    this.pagosSeleccionados.splice(index, 1);
    if (this.pagoActivoIndex === index) {
      this.pagoActivoIndex = this.pagosSeleccionados.length - 1;
    } else if (this.pagoActivoIndex > index) {
      this.pagoActivoIndex -= 1;
    }
    this.validarTotales();
  }

  setPagoActivo(i: number): void {
    this.pagoActivoIndex = i;
  }

  validarTotales(): void {
    this.sumaPagos = this.pagosSeleccionados.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
    this.restante = Number((this.data.total - this.sumaPagos).toFixed(2));
  }

  // ── Teclado numérico ──

  private get pagoActivo(): PagoTemporal | undefined {
    return this.pagosSeleccionados[this.pagoActivoIndex];
  }

  keypadDigit(n: number): void {
    const p = this.pagoActivo;
    if (!p) return;
    const next = (Number(p.monto) || 0) * 10 + n;
    if (next > 99_999_999) return;
    p.monto = next;
    this.validarTotales();
  }

  keypadBackspace(): void {
    const p = this.pagoActivo;
    if (!p) return;
    p.monto = Math.floor((Number(p.monto) || 0) / 10);
    this.validarTotales();
  }

  keypadClear(): void {
    const p = this.pagoActivo;
    if (!p) return;
    p.monto = 0;
    this.validarTotales();
  }

  keypadRestante(): void {
    const p = this.pagoActivo;
    if (!p) return;
    if (this.restante <= 0) return;
    p.monto = Number(((Number(p.monto) || 0) + this.restante).toFixed(2));
    this.validarTotales();
  }

  pagoRapido(metodo: MetodoPagoDTO): void {
    this.pagosConfirmados = [{ metodoPagoId: metodo.id, monto: Number(this.data.total.toFixed(2)) }];
    this.paso = 2;
  }

  async onConfirm(): Promise<void> {
    if (this.pagosSeleccionados.length === 0) {
      this.notif.warning('Agregá al menos un método de pago.');
      return;
    }
    if (this.restante !== 0) {
      this.notif.warning('Pago incompleto — el total de los pagos debe coincidir con el total de la venta.');
      return;
    }
    this.pagosConfirmados = this.pagosSeleccionados.map(p => ({
      metodoPagoId: p.metodoPagoId,
      monto: Number(p.monto)
    }));
    this.paso = 2;
  }

  getIconForMetodo(nombre: string): string {
    const n = (nombre || '').toLowerCase();
    if (n.includes('efectivo')) return 'payments';
    if (n.includes('qr')) return 'qr_code_2';
    if (n.includes('debito') || n.includes('débito')) return 'credit_card';
    if (n.includes('credito') || n.includes('crédito')) return 'credit_card';
    if (n.includes('tarjeta')) return 'credit_card';
    if (n.includes('transferencia')) return 'account_balance';
    if (n.includes('cuenta')) return 'receipt_long';
    return 'paid';
  }

  // ── Paso 2: opciones de comprobante ──

  onToggleFiscal(): void {
    if (this.ticketFiscal && this.clientes.length === 0) {
      this.cargandoClientes = true;
      this.clienteService.obtenerTodos().subscribe({
        next: res => { this.clientes = res; this.cargandoClientes = false; },
        error: () => {
          this.cargandoClientes = false;
          this.notif.error('No se pudieron cargar los clientes');
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
      this.notif.warning('Seleccione un cliente para la factura electrónica.');
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

  get progresoPagado(): number {
    if (this.data.total === 0) return 0;
    const pct = (this.sumaPagos / this.data.total) * 100;
    return Math.min(100, Math.max(0, pct));
  }
}
