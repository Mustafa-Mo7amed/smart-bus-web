import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-drivers',
  imports: [RouterOutlet],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.scss',
})
export class DriversComponent {
  private readonly router = inject(Router);
  isRegisterDriverRoute = signal(false);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isRegisterDriverRoute.set(this.router.url.endsWith('/register-driver'));
    });
  }
}
