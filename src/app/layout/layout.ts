import { Component, HostBinding, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../Service/auth-service';
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
  ) {

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

  toggleSidebar(open?: boolean) {
    if (open !== undefined) {
      this.isSidebarOpen.set(open);
    } else {
      this.isSidebarOpen.update(current => !current);
    }
  }
}