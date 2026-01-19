import { Component, HostBinding, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../Service/auth-service';

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
    public authService : AuthService,    
    private router: Router,
  ){

  }

    onLogout() {    
    this.authService.logout();

    this.router.navigate(['/login']); 
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