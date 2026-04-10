import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RouteService } from '../core/services/route.service';
import { Route } from '../shared/models/route.model';
@Component({
  selector: 'app-routes',
  imports: [MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss',
})
export class RoutesComponent implements OnInit {
  routeService = inject(RouteService);

  routes = signal<Route[]>([]);

  ngOnInit() {
    this.routeService.getAllRoutes().subscribe((routes) => {
      this.routes.set(routes);
    });
  }
}
