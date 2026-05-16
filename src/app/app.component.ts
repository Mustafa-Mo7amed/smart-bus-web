import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from "./shared/layout/header/header.component";
import { NavBarComponent } from "./shared/layout/nav-bar/nav-bar.component";
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  private router = inject(Router);
  
  protected readonly title = signal('smart-bus-web');
  
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    )
  );

  showLayout = computed(() => {
    const url = this.currentUrl();
    if (!url) return false;
    return url !== '/login' && !url?.startsWith('/login');
  });
}
