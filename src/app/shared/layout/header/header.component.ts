import { Component, inject } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { Router, NavigationEnd } from "@angular/router";
import { filter, map } from "rxjs/operators";

@Component({
  selector: 'app-header',
  imports: [MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private router = inject(Router);
  pageTitle = 'Overview';

  private readonly titleMap: Record<string, string> = {
    'overview': 'Overview',
    'routes': 'Routes',
    'drivers': 'Drivers',
    'buses': 'Buses',
    'assignments': 'Assignments',
    'reports': 'Reports',
  };

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(event => event.urlAfterRedirects || event.url)
      )
      .subscribe(url => {
        const segments = url.split('/').filter(Boolean);
        const key = segments[0] || 'Overview';
        this.pageTitle = this.titleMap[key] || key;
      });
  }
}
