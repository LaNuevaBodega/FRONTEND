import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { Carrito, PedidoVenta } from "../carrito/carrito";
import { Stock } from "../stock/stock";
import { CajaDTO } from "../../interfaces/CajaDTO/CajaDTO";
import { CajaService } from "../../Service/caja-service";
import { VentasService } from "../../Service/ventas-service";
import { MatDialog } from "@angular/material/dialog";
import Swal from "sweetalert2";
import { MatSlideToggleChange, MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TicketService } from "../../Service/ticket-service";
import { FacturaService } from "../../Service/factura-service";
import { TicketServiceArca } from "../../Service/ticket-service-arca";
import { DialogAbrirCaja } from "../dialog/dialog-abrir-caja/dialog-abrir-caja";
import { DialogCerrarCaja } from "../dialog/dialog-cerrar-caja/dialog-cerrar-caja";
import { DialogRetirarDinero } from "../dialog/dialog-retirar-dinero/dialog-retirar-dinero";

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    Carrito,
    Stock,
    MatSlideToggleModule
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss'
})
export class Ventas implements OnInit {

  @ViewChild(Carrito) carrito!: Carrito;

  get cajaAbierta(): CajaDTO | null { return this.cajaService.cajaActual; }
  set cajaAbierta(v: CajaDTO | null) { this.cajaService.cajaActual = v; }
  cargandoCaja = true;

  constructor(
    private cajaService: CajaService,
    private ventasService: VentasService,
    private ticketService: TicketService,
    private ticketServiceArca: TicketServiceArca,
    private facturaService: FacturaService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarEstadoCaja();
  }

  cargarEstadoCaja() {
    this.cajaService.obtenerCajaAbierta().subscribe({
      next: caja => { this.cajaAbierta = caja; this.cargandoCaja = false; },
      error: () => { this.cajaAbierta = null; this.cargandoCaja = false; }
    });
  }

  onToggleCaja(event: MatSlideToggleChange) {
    if (event.checked) {
      this.abrirCaja();
    } else {
      this.cerrarCaja();
    }
  }

  abrirCaja() {
    const ref = this.dialog.open(DialogAbrirCaja, { disableClose: true });
    ref.afterClosed().subscribe(monto => {
      if (monto === null || monto === undefined) return;
      this.cajaService.abrirCaja(Number(monto)).subscribe({
        next: caja => { this.cajaAbierta = caja; },
        error: err => { Swal.fire('Error', err.error?.mensaje ?? 'Error al abrir caja', 'error'); }
      });
    });
  }

  cerrarCaja() {
    const ref = this.dialog.open(DialogCerrarCaja, { disableClose: true });
    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.cajaService.cerrarCaja().subscribe({
        next: cierre => {
          const html = this.ticketService.generarHtmlCierre(cierre);
          this.ticketService.imprimir(html);
          this.cajaAbierta = null;
        }
      });
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleShortcuts(event: KeyboardEvent) {
    if (event.key.length === 1) return;

    if (event.key === 'F2') { event.preventDefault(); this.pagarRapido(); }
    if (event.key === 'F4') { event.preventDefault(); this.carrito.limpiar(); }
    if (event.key === 'Escape') { event.preventDefault(); this.carrito.limpiar(); }
  }

  pagarRapido() {
    if (!this.cajaAbierta) { Swal.fire('Caja cerrada', 'Debe abrir la caja', 'warning'); return; }
    if (!this.carrito || this.carrito.carrito.length === 0) return;
    this.carrito.confirmarVentaRapida();
  }

  retirarDinero() {
    if (!this.cajaAbierta) { Swal.fire('Caja cerrada', 'Debe abrir la caja', 'warning'); return; }

    const ref = this.dialog.open(DialogRetirarDinero, { disableClose: true });
    ref.afterClosed().subscribe(resultado => {
      if (!resultado) return;
      this.cajaService.retirar(resultado.monto, resultado.motivo).subscribe({
        next: () => { },
        error: err => { Swal.fire('Error', err.error?.mensaje ?? 'Error al retirar', 'error'); }
      });
    });
  }

  crearVenta(pedido: PedidoVenta) {
    if (!this.cajaAbierta) {
      Swal.fire('Caja cerrada', 'Debe abrir la caja', 'warning');
      return;
    }

    this.ventasService.crearVenta(pedido.dto).subscribe({
      next: venta => {
        Swal.fire({ icon: 'success', title: 'Venta registrada', timer: 1500, showConfirmButton: false });

        if (pedido.ticketFiscal && pedido.clienteId != null) {
          this.facturaService.solicitar({ ventaId: venta.id, clienteId: pedido.clienteId }).subscribe({
            next: async factura => {
              const html = await this.ticketServiceArca.generarHtmlFactura(factura, venta);
              this.ticketServiceArca.imprimir(html);
            },
            error: err => {
              Swal.fire('Error ARCA', err.error?.mensaje ?? 'No se pudo emitir la factura electrónica', 'error');
              if (pedido.imprimirTicket) {
                const html = this.ticketService.generarHtmlVenta(venta);
                this.ticketService.imprimir(html);
              }
            }
          });
        } else if (pedido.imprimirTicket) {
          const html = this.ticketService.generarHtmlVenta(venta);
          this.ticketService.imprimir(html);
        }
      },
      error: err => {
        Swal.fire('Error', err.error?.mensaje ?? 'Error al crear venta', 'error');
      }
    });
  }

}
