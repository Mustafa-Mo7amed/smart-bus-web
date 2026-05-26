import { Component, inject, OnInit, signal } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { Route, RouteDetailed } from '../../shared/models/route.model';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';

export interface RouteListItem {
  details: RouteDetailed;
  numberOfMicrobusesInQueue: number;
  numberOfMicrobusesOnTheWay: number;
  nearestArrivalMinutes: number;
}

@Component({
  selector: 'app-routes-list',
  imports: [MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './routes-list.component.html',
  styleUrl: './routes-list.component.scss',
})
export class RoutesListComponent implements OnInit {
  routeService = inject(RouteService);
  isLoading = false;
  routes = signal<RouteListItem[]>([]);

  ngOnInit() {
    this.isLoading = true;
    this.routeService
      .getAllRouteListItems()
      .subscribe({
        next: (routes) => {
          this.routes.set(routes);
          console.log(routes);
          this.isLoading = false;
        },
        error: (error) => {
          console.log(this.routes);
          // TODO: replace with some pop-up cards
          console.error('Error fetching routes:', error);
          this.isLoading = false;
        },
      });
  }
}
