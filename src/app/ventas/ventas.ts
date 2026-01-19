import { Component, OnInit } from "@angular/core";
import { Carrito } from "../carrito/carrito";
import { Stock } from "../stock/stock";
import { CajaDTO } from "../../interfaces/CajaDTO/CajaDTO";
import { CajaService } from "../../Service/caja-service";
import { VentasService } from "../../Service/ventas-service";
import { MatDialog } from "@angular/material/dialog";

import Swal from "sweetalert2";
import { DialogAbrirCaja } from "../dialog/dialog-abrir-caja/dialog-abrir-caja";
import { MatSlideToggleChange, MatSlideToggleModule } from "@angular/material/slide-toggle";
import { CrearVentaDTO } from "../../interfaces/Ventas/VentaDTO/CrearVentaDTO";

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

  cajaAbierta: CajaDTO | null = null;
  cargandoCaja = true;
  
  constructor(
    private cajaService: CajaService,
    private ventasService: VentasService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarEstadoCaja();
  }

  cargarEstadoCaja() {
    this.cajaService.obtenerCajaAbierta().subscribe({
      next: caja => {
        this.cajaAbierta = caja;
        this.cargandoCaja = false;
      },
      error: () => {
        this.cajaAbierta = null;
        this.cargandoCaja = false;
      }
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
    this.cajaService.abrirCaja(0).subscribe({
      next: caja => this.cajaAbierta = caja
    });
  }

  cerrarCaja() {
    Swal.fire({
      title: 'Cerrar caja',
      text: '¿Desea cerrar la caja?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar caja',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.cajaService.cerrarCaja().subscribe({
        next: () => {
          this.cajaAbierta = null;
          Swal.fire('Caja cerrada', '', 'success');
        }
      });
    });
  }

  crearVenta(dto: CrearVentaDTO) {
    if (!this.cajaAbierta) {
      Swal.fire('Caja cerrada', 'Debe abrir la caja', 'warning');
      return;
    }

    this.ventasService.crearVenta(dto).subscribe({
      next: venta => {        
        const html = this.generarHtmlTicket(venta);
        this.imprimirTicket(html);

        Swal.fire('Venta registrada', '', 'success');
      },
      error: err => {
        Swal.fire(
          'Error',
          err.error?.mensaje ?? 'Error al crear venta',
          'error'
        );
      }
    });
  }

  private generarHtmlTicket(venta: any): string {
    return `
  <html>
    <head>
      <style>
        body {
          width: 280px;
          font-family: monospace;
          font-size: 12px;
        }
        .center {
          text-align: center;
        }
        .logo {
          max-width: 160px;
          margin-bottom: 6px;
        }
        .line {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
      </style>
    </head>
    <body>
      <div class="center">        
        <div><strong>LA NUEVA BODEGA</strong></div>
        <div>Ticket interno</div>
        <div>Venta Nº ${venta.numeroVenta}</div>
      </div>

      <div class="line"></div>

      ${venta.detalles.map((d: any) => `
        ${d.productoNombre}<br>
        ${d.cantidad} x $${d.precioUnitario} = $${d.subtotal}<br>
      `).join('')}

      <div class="line"></div>

      <strong>Total: $${venta.total}</strong><br>
      Pago: ${venta.metodoDePago}<br>
      ${new Date(venta.fechaHora).toLocaleString()}

      <div class="center">
        <br>Gracias por su compra
      </div>
    </body>
  </html>
  `;
  }




  private imprimirTicket(html: string) {
    const win = window.open('', '_blank', 'width=300,height=600');
    if (!win) return;

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.focus();
    win.print();
    win.close();
  }


}
