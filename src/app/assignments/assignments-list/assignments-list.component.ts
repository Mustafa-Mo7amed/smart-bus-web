import { Component, effect, inject, signal, untracked, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { DriverService } from '../../core/services/driver.service';
import { DriverSortBy } from '../../shared/models/driver.model';

interface Assignment {
  id: string;
  name: string;
  licenseNumber: string;
  plateNumber: string;
}

function getStableLicenseNumber(driverId: string): string {
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = (hash << 5) - hash + driverId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash).toString();
  const prefix = (Math.abs(hash) % 2 === 0) ? '2' : '3';
  const padded = absHash.padEnd(13, '0').slice(0, 13);
  return prefix + padded;
}

@Component({
  selector: 'app-assignments-list',
  standalone: true,
  imports: [MatIcon, RouterLink, PaginatorComponent, FormsModule, CommonModule],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.scss'
})
export class AssignmentsListComponent {
  private readonly driverService = inject(DriverService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isLoading = signal(false);
  assignments = signal<Assignment[]>([]);
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
      untracked(() => this.fetchAssignments());
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

  fetchAssignments() {
    this.isLoading.set(true);
    this.updateQueryParams();

    const query = this.search().trim();

    this.driverService.getStationDrivers({
      pageNumber: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      search: query || undefined,
      sortBy: this.sortBy() !== null ? this.sortBy() : undefined,
      sortOrder: this.sortOrder() || undefined,
    }).subscribe({
      next: (response) => {
        const list = (response.data || []).map(d => ({
          id: d.driverId,
          name: d.driverName,
          licenseNumber: d.licenseNumber || getStableLicenseNumber(d.driverId),
          plateNumber: d.plateNumber
        }));
        this.assignments.set(list);
        this.totalCount.set(response.totalCount || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching assignments:', error);
        this.assignments.set([]);
        this.totalCount.set(0);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  updateDebouncedField(value: string) {
    this.searchQuery.set(value);
    this.debounceSubject.next();
  }

  onFilterChange() {
    this.pageIndex.set(0);
    this.fetchAssignments();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.search.set('');
    this.sortBy.set(null);
    this.sortOrder.set('DESC');
    this.onFilterChange();
  }
}
