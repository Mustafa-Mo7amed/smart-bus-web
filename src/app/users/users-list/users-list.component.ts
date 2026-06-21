import {
  Component,
  effect,
  inject,
  signal,
  untracked,
  computed,
  OnInit,
  input,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';
import { UserInfo } from '../../shared/models/user.model';
import { ResetPasswordModalComponent } from '../../shared/components/reset-password-modal/reset-password-modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [MatIcon, RouterLink, PaginatorComponent, FormsModule, CommonModule, ResetPasswordModalComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  baseURL = computed(() => 'https://smart-microbus.runasp.net/');
  showOnlyManagers = input<boolean>(false);

  isLoading = signal(false);
  users = signal<UserInfo[]>([]);
  totalCount = signal(0);

  pageSize = signal(5);
  pageIndex = signal(0);
  pageSizeOptions = signal<number[]>([5, 10, 20, 50]);

  // UI / Immediate Input Signals
  searchQuery = signal('');
  selectedRole = signal<string>('');

  // Active Filters
  search = signal('');
  role = signal<string>('');
  sortBy = signal<'Name' | 'Role' | null>(null);
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  showFilters = signal(false);
  showResetPasswordModal = signal(false);
  selectedUserForReset = signal<UserInfo | null>(null);

  private debounceSubject = new Subject<void>();

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (!this.showOnlyManagers() && this.selectedRole()) count++;
    if (this.sortBy() !== null) count++;
    if (this.sortOrder() !== 'DESC') count++;
    return count;
  });

  constructor() {
    effect(() => {
      const pageIndex = this.pageIndex();
      const pageSize = this.pageSize();
      untracked(() => this.fetchUsers());
    });

    this.debounceSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => {
      this.search.set(this.searchQuery());
      this.onFilterChange();
    });
  }

  ngOnInit() {
    const params = this.activatedRoute.snapshot.queryParamMap;
    if (params.has('search')) {
      const searchVal = params.get('search')!;
      this.searchQuery.set(searchVal);
      this.search.set(searchVal);
    }

    if (this.showOnlyManagers()) {
      this.selectedRole.set('Manager');
      this.role.set('Manager');
    } else if (params.has('role')) {
      const roleVal = params.get('role')!;
      this.selectedRole.set(roleVal);
      this.role.set(roleVal);
    }

    if (params.has('sortBy')) this.sortBy.set(params.get('sortBy') as any);
    if (params.has('sortOrder')) this.sortOrder.set(params.get('sortOrder') as any);
    if (params.has('pageIndex')) this.pageIndex.set(Number(params.get('pageIndex')));
    if (params.has('pageSize')) this.pageSize.set(Number(params.get('pageSize')));

    if (this.activeFiltersCount() > 0) {
      this.showFilters.set(true);
    }
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        search: this.search() || null,
        role: this.showOnlyManagers() ? null : this.role() || null,
        sortBy: this.sortBy() === null ? null : this.sortBy(),
        sortOrder: this.sortOrder() === 'DESC' ? null : this.sortOrder(),
        pageIndex: this.pageIndex() === 0 ? null : this.pageIndex(),
        pageSize: this.pageSize() === 5 ? null : this.pageSize(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  fetchUsers() {
    this.isLoading.set(true);
    this.updateQueryParams();
    this.adminService
      .getUsers({
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        role: this.role() || undefined,
        sortBy: this.sortBy() !== null ? this.sortBy() : undefined,
        sortOrder: this.sortOrder() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response.data?.items || []);
          this.totalCount.set(response.data?.totalCount || 0);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching users:', error);
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

  onRoleChange(value: string) {
    this.selectedRole.set(value);
    this.role.set(value);
    this.onFilterChange();
  }

  onFilterChange() {
    this.pageIndex.set(0);
    this.fetchUsers();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.search.set('');
    if (this.showOnlyManagers()) {
      this.selectedRole.set('Manager');
      this.role.set('Manager');
    } else {
      this.selectedRole.set('');
      this.role.set('');
    }
    this.sortBy.set(null);
    this.sortOrder.set('DESC');
    this.onFilterChange();
  }

  viewUser(userId: string) {
    this.router.navigate(['/users', 'details', userId]);
  }

  toggleUserLock(event: Event, user: UserInfo) {
    event.stopPropagation();
    const action = user.isActive
      ? this.adminService.lockUser(user.id)
      : this.adminService.unlockUser(user.id);
    action.subscribe({
      next: (response) => {
        if (response.success) {
          this.users.update((current) =>
            current.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
          );
        }
      },
      error: (err) => {
        console.error('Error toggling user lock:', err);
      },
    });
  }

  triggerResetPassword(event: Event, user: UserInfo) {
    event.stopPropagation();
    this.selectedUserForReset.set(user);
    this.showResetPasswordModal.set(true);
  }
}
