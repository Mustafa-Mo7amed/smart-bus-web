import { Component, effect, inject, signal, untracked, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { BusService } from '../../core/services/bus.service';
import { RouteService } from '../../core/services/route.service';
import { DriverService } from '../../core/services/driver.service';
import { BusListItem, BusSearchBy, BusSortBy } from '../../shared/models/bus.model';
import { RouteDetailed } from '../../shared/models/route.model';
import { GetDriverModel } from '../../shared/models/driver.model';

@Component({
  selector: 'app-buses-list',
  standalone: true,
  imports: [MatIcon, RouterLink, PaginatorComponent, FormsModule, CommonModule],
  templateUrl: './buses-list.component.html',
  styleUrl: './buses-list.component.scss',
})
export class BusesListComponent {
  private readonly busService = inject(BusService);
  private readonly routeService = inject(RouteService);
  private readonly driverService = inject(DriverService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isLoading = signal(false);
  buses = signal<BusListItem[]>([]);
  totalCount = signal(0);

  pageSize = signal(5);
  pageIndex = signal(0);
  pageSizeOptions = signal<number[]>([5, 10, 20, 50]);

  // Dropdown options
  routesList = signal<RouteDetailed[]>([]);
  driversList = signal<GetDriverModel[]>([]);

  // UI / Immediate Input Signals
  searchStringInput = signal('');

  // Active Filters
  searchBy = signal<BusSearchBy | null>(null);
  searchString = signal('');
  isActive = signal<boolean | null>(null);
  routeId = signal<string | null>(null);
  driverId = signal<string | null>(null);
  sortBy = signal<BusSortBy | null>(null);
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  showFilters = signal(false);
  isExporting = signal(false);

  private debounceSubject = new Subject<void>();

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchStringInput().trim()) count++;
    if (this.searchBy() !== null) count++;
    if (this.isActive() !== null) count++;
    if (this.routeId() !== null) count++;
    if (this.driverId() !== null) count++;
    if (this.sortBy() !== null) count++;
    if (this.sortOrder() !== 'DESC') count++;
    return count;
  });

  BusSearchBy = BusSearchBy;
  BusSortBy = BusSortBy;

  constructor() {
    const params = this.activatedRoute.snapshot.queryParamMap;
    if (params.has('searchString')) {
      const searchVal = params.get('searchString')!;
      this.searchStringInput.set(searchVal);
      this.searchString.set(searchVal);
    }
    if (params.has('searchBy')) this.searchBy.set(params.get('searchBy') as BusSearchBy);
    if (params.has('isActive')) this.isActive.set(params.get('isActive') === 'true');
    if (params.has('routeId')) this.routeId.set(params.get('routeId'));
    if (params.has('driverId')) this.driverId.set(params.get('driverId'));
    if (params.has('sortBy')) this.sortBy.set(params.get('sortBy') as BusSortBy);
    if (params.has('sortOrder')) this.sortOrder.set(params.get('sortOrder') as any);
    if (params.has('pageIndex')) this.pageIndex.set(Number(params.get('pageIndex')));
    if (params.has('pageSize')) this.pageSize.set(Number(params.get('pageSize')));
    
    if (this.activeFiltersCount() > 0) {
      this.showFilters.set(true);
    }

    this.routeService.getAllRoutes().subscribe((routes) => this.routesList.set(routes));
    this.driverService.getStationDrivers({ pageSize: 10000 }).subscribe((res) => this.driversList.set(res.data || []));

    effect(() => {
      const pageIndex = this.pageIndex();
      const pageSize = this.pageSize();
      untracked(() => this.fetchBuses());
    });

    this.debounceSubject
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.searchString.set(this.searchStringInput());
        this.onFilterChange();
      });
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        searchString: this.searchString() || null,
        searchBy: this.searchBy() || null,
        isActive: this.isActive() !== null ? this.isActive() : null,
        routeId: this.routeId() || null,
        driverId: this.driverId() || null,
        sortBy: this.sortBy() || null,
        sortOrder: this.sortOrder() === 'DESC' ? null : this.sortOrder(),
        pageIndex: this.pageIndex() === 0 ? null : this.pageIndex(),
        pageSize: this.pageSize() === 5 ? null : this.pageSize(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  fetchBuses() {
    this.isLoading.set(true);
    this.updateQueryParams();
    this.busService.getStationBuses({
      pageNumber: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      searchString: this.searchString() || undefined,
      searchBy: this.searchBy() || undefined,
      isActive: this.isActive() !== null ? this.isActive()! : undefined,
      routeId: this.routeId() || undefined,
      driverId: this.driverId() || undefined,
      sortBy: this.sortBy() || undefined,
      orderOptions: this.sortOrder() || undefined,
    }).subscribe({
      next: (response) => {
        this.buses.set(response.items || []);
        this.totalCount.set(response.totalCount || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching buses:', error);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  updateDebouncedField(field: 'searchString', value: any) {
    if (field === 'searchString') this.searchStringInput.set(value);
    this.debounceSubject.next();
  }

  onFilterChange() {
    this.pageIndex.set(0);
    this.fetchBuses();
  }

  resetFilters() {
    this.searchStringInput.set('');
    this.searchString.set('');
    this.searchBy.set(null);
    this.isActive.set(null);
    this.routeId.set(null);
    this.driverId.set(null);
    this.sortBy.set(null);
    this.sortOrder.set('DESC');
    this.onFilterChange();
  }

  viewBus(busId: string) {
    this.router.navigate(['/buses', 'details', busId]);
  }

  exportBuses() {
    this.isExporting.set(true);
    this.busService.exportStationMicrobuses().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buses-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: (err) => {
        console.error('Export failed', err);
        this.isExporting.set(false);
      }
    });
  }
}
