import { Component, effect, inject, signal, untracked, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StaffService } from '../../core/services/staff.service';
import { StaffListItem } from '../../shared/models/staff.model';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    PaginatorComponent,
    FormsModule,
    CommonModule,
    MatMenuModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.scss',
})
export class StaffListComponent {
  private readonly staffService = inject(StaffService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isLoading = signal(false);
  staffList = signal<StaffListItem[]>([]);
  totalCount = signal(0);

  pageSize = signal(5);
  pageIndex = signal(0);
  pageSizeOptions = signal<number[]>([5, 10, 20, 50]);

  // UI / Immediate Input Signals
  searchQuery = signal('');

  // Active Filters
  search = signal('');
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  showFilters = signal(false);

  private debounceSubject = new Subject<void>();

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.sortOrder() !== 'DESC') count++;
    return count;
  });

  // Confirmation dialog state
  confirmDialog = signal<{
    show: boolean;
    title: string;
    message: string;
    confirmText: string;
    icon: string;
    type?: 'danger' | 'primary';
    action: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    icon: 'help_outline',
    action: () => {},
  });

  constructor() {
    const params = this.activatedRoute.snapshot.queryParamMap;
    if (params.has('search')) {
      const searchVal = params.get('search')!;
      this.searchQuery.set(searchVal);
      this.search.set(searchVal);
    }
    if (params.has('sortOrder')) this.sortOrder.set(params.get('sortOrder') as any);
    if (params.has('pageIndex')) this.pageIndex.set(Number(params.get('pageIndex')));
    if (params.has('pageSize')) this.pageSize.set(Number(params.get('pageSize')));

    if (this.activeFiltersCount() > 0) {
      this.showFilters.set(true);
    }

    effect(() => {
      const pageIndex = this.pageIndex();
      const pageSize = this.pageSize();
      untracked(() => this.fetchStaff());
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
        sortOrder: this.sortOrder() === 'DESC' ? null : this.sortOrder(),
        pageIndex: this.pageIndex() === 0 ? null : this.pageIndex(),
        pageSize: this.pageSize() === 5 ? null : this.pageSize(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  fetchStaff() {
    this.isLoading.set(true);
    this.updateQueryParams();
    const apiSortOrder = this.sortOrder() === 'DESC' ? 'ASC' : 'DESC';
    this.staffService.getStationStaff({
      pageNumber: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      search: this.search() || undefined,
      sortOrder: apiSortOrder,
    }).subscribe({
      next: (response) => {
        this.staffList.set(response.data || []);
        this.totalCount.set(response.totalCount || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching staff:', error);
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
    this.fetchStaff();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.search.set('');
    this.sortOrder.set('DESC');
    this.onFilterChange();
  }

  navigateToUpdate(staffId: string) {
    this.router.navigate(['/staff', 'update-staff', staffId]);
  }

  deleteStaff(staffId: string, name: string) {
    this.confirmDialog.set({
      show: true,
      title: 'Delete Staff Member',
      message: `Are you sure you want to permanently delete staff member "${name}"?`,
      confirmText: 'Delete',
      icon: 'delete_forever',
      type: 'danger',
      action: () => {
        this.closeConfirm();
        this.isLoading.set(true);
        this.staffService.deleteStaff(staffId).subscribe({
          next: () => {
            this.fetchStaff();
          },
          error: (error) => {
            console.error('Error deleting staff:', error);
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  closeConfirm() {
    this.confirmDialog.update((state) => ({ ...state, show: false }));
  }

  executeConfirm() {
    this.confirmDialog().action();
  }
}
