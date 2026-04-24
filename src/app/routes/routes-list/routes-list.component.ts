import { Component, inject, OnInit, signal } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { Route } from '../../shared/models/route.model';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-routes-list',
  imports: [MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './routes-list.component.html',
  styleUrl: './routes-list.component.scss',
})
export class RoutesListComponent implements OnInit {
  routeService = inject(RouteService);
  isLoading = false;
  routes = signal<Route[]>([]);

  ngOnInit() {
    this.isLoading = true;
    this.routeService.getAllRoutes().subscribe({
      next: (routes) => {
        this.routes.set(routes);
        this.isLoading = false;
      },
      error: (error) => {
        // TODO: replace with some pop-up cards
        console.error('Error fetching routes:', error);
        this.isLoading = false;
      },
    });
  }
}
