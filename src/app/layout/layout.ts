import { Component, HostBinding, HostListener, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../Service/auth-service';
import { CajaService } from '../../Service/caja-service';
import { TicketService } from '../../Service/ticket-service';
import { MatDialog } from '@angular/material/dialog';
import { DialogAbrirCaja } from '../dialog/dialog-abrir-caja/dialog-abrir-caja';
import { DialogCerrarCaja } from '../dialog/dialog-cerrar-caja/dialog-cerrar-caja';
import { DialogRetirarDinero } from '../dialog/dialog-retirar-dinero/dialog-retirar-dinero';
import { NotificationService } from '../../Service/notification-service';
import { PermisosService } from '../../Service/permisos-service';

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
    MatTooltipModule,
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router,
    private cajaService: CajaService,
    private ticketService: TicketService,
    private dialog: MatDialog,
    private notif: NotificationService,
    private permisosService: PermisosService,
  ) { }

  ngOnInit() {
    // Carga la configuración de vistas para que el menú respete los permisos.
    this.permisosService.obtener().subscribe();
  }

  // El menú consulta esto para mostrar/ocultar secciones de empleados.
  puedeVer(clave: string): boolean {
    return this.permisosService.puedeVer(clave);
  }

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
        error: err => { this.notif.error(err.error?.mensaje ?? 'Error al abrir caja'); }
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
    if (!this.cajaAbierta) { this.notif.warning('Caja cerrada — Debe abrir la caja'); return; }
    const ref = this.dialog.open(DialogRetirarDinero, { disableClose: true });
    ref.afterClosed().subscribe(resultado => {
      if (!resultado) return;
      this.cajaService.retirar(resultado.monto, resultado.motivo).subscribe({
        next: () => { },
        error: err => { this.notif.error(err.error?.mensaje ?? 'Error al retirar'); }
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
          this.notif.info('Sesión inválida — Tu sesión expiró, iniciá sesión nuevamente');
          this.authService.forceLogout();
          this.router.navigate(['/login']);
          return;
        }

        this.notif.warning('Caja abierta — ' + (err.error ?? 'Debe cerrar la caja antes de cerrar sesión'));
      }
    });
  }



  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(current => !current);
  }
}