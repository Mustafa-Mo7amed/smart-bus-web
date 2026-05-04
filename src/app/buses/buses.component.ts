import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-buses',
  imports: [RouterOutlet],
  templateUrl: './buses.component.html',
  styleUrl: './buses.component.scss',
})
export class BusesComponent {
  private readonly router = inject(Router);
  isRegisterBusRoute = signal(false);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isRegisterBusRoute.set(this.router.url.endsWith('/register-bus'));
    });
  }
}
