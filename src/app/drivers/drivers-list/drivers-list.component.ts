import { Component, effect, inject, signal, untracked, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { DriverService } from '../../core/services/driver.service';
import { GetDriverModel, DriverSortBy } from '../../shared/models/driver.model';

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [MatIcon, RouterLink, PaginatorComponent, FormsModule, CommonModule],
  templateUrl: './drivers-list.component.html',
  styleUrl: './drivers-list.component.scss',
})
export class DriversListComponent {
  private readonly driverService = inject(DriverService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isLoading = signal(false);
  drivers = signal<GetDriverModel[]>([]);
  totalCount = signal(0);

  pageSize = signal(5);
  pageIndex = signal(0);
  pageSizeOptions = signal<number[]>([5, 10, 20, 50]);

  // UI / Immediate Input Signals
  searchQuery = signal('');

  // Active Filters
  search = signal('');
  sortBy = signal<DriverSortBy | null>(null);
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  showFilters = signal(false);
  isExporting = signal(false);

  private debounceSubject = new Subject<void>();

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.sortBy() !== null) count++;
    if (this.sortOrder() !== 'DESC') count++;
    return count;
  });

  DriverSortBy = DriverSortBy;

  constructor() {
    const params = this.activatedRoute.snapshot.queryParamMap;
    if (params.has('search')) {
      const searchVal = params.get('search')!;
      this.searchQuery.set(searchVal);
      this.search.set(searchVal);
    }
    if (params.has('sortBy')) this.sortBy.set(Number(params.get('sortBy')) as DriverSortBy);
    if (params.has('sortOrder')) this.sortOrder.set(params.get('sortOrder') as any);
    if (params.has('pageIndex')) this.pageIndex.set(Number(params.get('pageIndex')));
    if (params.has('pageSize')) this.pageSize.set(Number(params.get('pageSize')));
    
    if (this.activeFiltersCount() > 0) {
      this.showFilters.set(true);
    }

    effect(() => {
      const pageIndex = this.pageIndex();
      const pageSize = this.pageSize();
      untracked(() => this.fetchDrivers());
    });

    this.debounceSubject
      .pipe(
        debounceTime(300),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.search.set(this.searchQuery());
        this.onFilterChange();
      });
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        search: this.search() || null,
        sortBy: this.sortBy() === null ? null : this.sortBy(),
        sortOrder: this.sortOrder() === 'DESC' ? null : this.sortOrder(),
        pageIndex: this.pageIndex() === 0 ? null : this.pageIndex(),
        pageSize: this.pageSize() === 5 ? null : this.pageSize(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  fetchDrivers() {
    this.isLoading.set(true);
    this.updateQueryParams();
    this.driverService.getStationDrivers({
      pageNumber: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      search: this.search() || undefined,
      sortBy: this.sortBy() !== null ? this.sortBy() : undefined,
      sortOrder: this.sortOrder() || undefined,
    }).subscribe({
      next: (response) => {
        this.drivers.set(response.data || []);
        this.totalCount.set(response.totalCount || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching drivers:', error);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  updateDebouncedField(field: 'searchQuery', value: any) {
    if (field === 'searchQuery') this.searchQuery.set(value);
    this.debounceSubject.next();
  }

  onFilterChange() {
    this.pageIndex.set(0);
    this.fetchDrivers();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.search.set('');
    this.sortBy.set(null);
    this.sortOrder.set('DESC');
    this.onFilterChange();
  }

  viewDriver(driverId: string) {
    this.router.navigate(['/drivers', 'details', driverId]);
  }

  exportDrivers() {
    this.isExporting.set(true);
    this.driverService.exportStationDrivers().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drivers-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
