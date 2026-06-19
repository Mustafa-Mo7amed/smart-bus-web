import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App implements OnInit {
  protected readonly title = signal('Wasla');
  protected readonly isLoading = signal(false);
  private router = inject(Router);
  private loaderTimeout: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.loaderTimeout = setTimeout(() => {
          this.isLoading.set(true);
        }, 200);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        clearTimeout(this.loaderTimeout);
        this.isLoading.set(false);
      }
    });
  }
}
