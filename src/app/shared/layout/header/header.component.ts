import { Component, inject } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { Router, NavigationEnd } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { AuthService } from "../../../core/services/auth.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-header',
  imports: [MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  pageTitle = 'Overview';
  currentUser = this.authService.currentUser;

  private readonly titleMap: Record<string, string> = {
    'overview': 'Overview',
    'routes': 'Routes',
    'drivers': 'Drivers',
    'staff': 'Staff',
    'buses': 'Buses',
    'assignments': 'Assignments',
    'reports': 'Reports',
    'profile': 'Profile',
  };

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(event => event.urlAfterRedirects || event.url)
      )
      .subscribe(url => {
        const urlWithoutQueryParams = url.split('?')[0];
        const segments = urlWithoutQueryParams.split('/').filter(Boolean);
        const key = segments[0] || 'overview';
        this.pageTitle = this.titleMap[key] || key;
      });
  }

  getPhotoUrl(photoUrl: string | undefined): string {
    if (!photoUrl) return 'wasla-logo-rounded.png';
    if (photoUrl.startsWith('http')) return photoUrl;
    const baseDomain = environment.baseURL.replace(/\/api\/v.*/, '');
    return `${baseDomain}/${photoUrl}`;
  }

  onProfileClick() {
    this.router.navigate(['/profile']);
  }
}
