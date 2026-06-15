import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { RouteDetailed } from '../../shared/models/route.model';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';

export interface RouteListItem {
  details: RouteDetailed;
  numberOfMicrobusesInQueue: number;
  numberOfMicrobusesOnTheWay: number;
  nearestArrivalMinutes: number;
}

@Component({
  selector: 'app-routes-list',
  imports: [MatIcon, RouterLink, RouterLinkActive, PaginatorComponent],
  templateUrl: './routes-list.component.html',
  styleUrl: './routes-list.component.scss',
})
export class RoutesListComponent {
  routeService = inject(RouteService);
  isLoading = signal(false);
  routes = signal<RouteListItem[]>([]);
  totalCount = signal(0);

  pageSize = signal(5);
  pageIndex = signal(0);
  pageSizeOptions = signal<number[]>([5, 10, 20, 50]);

  constructor() {
    effect(() => {
      const pageIndex = this.pageIndex();
      const pageSize = this.pageSize();
      untracked(() => this.fetchRoutes(pageIndex + 1, pageSize));
    });
  }

  fetchRoutes(pageNumber: number, pageSize: number) {
    this.isLoading.set(true);
    this.routeService.getRouteListItems(pageNumber, pageSize).subscribe({
      next: (response) => {
        this.routes.set(response.data);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching routes:', error);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
