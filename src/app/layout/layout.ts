import { Component, HostBinding, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../Service/auth-service';
import { CajaService } from '../../Service/caja-service';
import { TicketService } from '../../Service/ticket-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogAbrirCaja } from '../dialog/dialog-abrir-caja/dialog-abrir-caja';
import { DialogCerrarCaja } from '../dialog/dialog-cerrar-caja/dialog-cerrar-caja';
import { DialogRetirarDinero } from '../dialog/dialog-retirar-dinero/dialog-retirar-dinero';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {

  constructor(
    public authService: AuthService,
    private router: Router,
    private cajaService: CajaService,
    private ticketService: TicketService,
    private dialog: MatDialog,
  ) { }

  get cajaAbierta() { return this.cajaService.cajaActual; }

  @HostListener('window:keydown', ['$event'])
  handleShortcuts(event: KeyboardEvent) {
    if (event.key.length === 1) return;
    if (event.key === 'F6') { event.preventDefault(); this.cajaAbierta ? this.cerrarCaja() : this.abrirCaja(); }
    if (event.key === 'F7') { event.preventDefault(); this.retirarDinero(); }
  }

  abrirCaja() {
    const ref = this.dialog.open(DialogAbrirCaja, { disableClose: true });
    ref.afterClosed().subscribe(monto => {
      if (monto === null || monto === undefined) return;
      this.cajaService.abrirCaja(Number(monto)).subscribe({
        next: caja => { this.cajaService.cajaActual = caja; },
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
          this.cajaService.cajaActual = null;
        }
      });
    });
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

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: err => {

        if (err.status === 401) {
          Swal.fire(
            'Sesión inválida',
            'Tu sesión expiró, iniciá sesión nuevamente',
            'info'
          );
          this.authService.forceLogout();
          this.router.navigate(['/login']);
          return;
        }

        Swal.fire(
          'Caja abierta',
          err.error ?? 'Debe cerrar la caja antes de cerrar sesión',
          'warning'
        );
      }
    });
  }



  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(current => !current);
  }
}