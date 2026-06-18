import { Component, effect, inject, signal, untracked, computed } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { RouteDetailed } from '../../shared/models/route.model';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export interface RouteListItem {
  details: RouteDetailed;
  numberOfMicrobusesInQueue: number;
  numberOfMicrobusesOnTheWay: number;
  nearestArrivalMinutes: number;
}

@Component({
  selector: 'app-routes-list',
  imports: [MatIcon, RouterLink, PaginatorComponent, FormsModule, CommonModule],
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

  // Filters
  searchQuery = signal('');
  search = signal('');
  sortBy = signal<'To' | 'Price' | 'Distance' | null>(null);
  sortOrder = signal<'ASC' | 'DESC'>('DESC');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  minDistance = signal<number | null>(null);
  maxDistance = signal<number | null>(null);

  showFilters = signal(false);

  private searchSubject = new Subject<string>();

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.sortBy() !== null) count++;
    if (this.sortOrder() !== 'DESC') count++;
    if (this.minPrice() !== null) count++;
    if (this.maxPrice() !== null) count++;
    if (this.minDistance() !== null) count++;
    if (this.maxDistance() !== null) count++;
    return count;
  });

  constructor() {
    effect(() => {
      const pageIndex = this.pageIndex();
      const pageSize = this.pageSize();
      untracked(() => this.fetchRoutes());
    });

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((value) => {
        this.search.set(value);
        this.onFilterChange();
      });
  }

  fetchRoutes() {
    this.isLoading.set(true);
    this.routeService.getRouteListItems({
      pageNumber: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      search: this.search() || undefined,
      sortBy: this.sortBy() || undefined,
      sortOrder: this.sortOrder() || undefined,
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      minDistance: this.minDistance() ?? undefined,
      maxDistance: this.maxDistance() ?? undefined,
    }).subscribe({
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

  onSearchQueryChange(value: string) {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onFilterChange() {
    this.pageIndex.set(0);
    this.fetchRoutes();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.search.set('');
    this.sortBy.set(null);
    this.sortOrder.set('DESC');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minDistance.set(null);
    this.maxDistance.set(null);
    this.onFilterChange();
  }
}
