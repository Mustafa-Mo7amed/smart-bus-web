import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  private router = inject(Router);
  public readonly authService = inject(AuthService);

  onBackgroundJobs() {
    const token = this.authService.getToken();
    if (token) {
      document.cookie = `token=${token}; path=/;`;
    }
    window.open('http://smart-microbus.runasp.net/dashboard', '_blank');
  }

  isLoggingOut = signal(false);

  onLogout() {
    if (this.isLoggingOut()) return;
    this.isLoggingOut.set(true);

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']).then(() => {
          this.isLoggingOut.set(false);
        });
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']).then(() => {
          this.isLoggingOut.set(false);
        });
      }
    });
  }
}
