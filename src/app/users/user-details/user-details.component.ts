import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { UserInfo } from '../../shared/models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ResetPasswordModalComponent } from '../../shared/components/reset-password-modal/reset-password-modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UpdateManagerModalComponent } from '../../shared/components/update-manager-modal/update-manager-modal.component';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    ResetPasswordModalComponent,
    ConfirmDialogComponent,
    UpdateManagerModalComponent
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  baseURL = computed(() => 'https://smart-microbus.runasp.net/');
  readonly userId = input.required<string>();

  user = signal<UserInfo | null>(null);
  isLoading = signal(false);
  showResetPasswordModal = signal(false);
  showUpdateManagerModal = signal(false);

  confirmDialog = signal<{
    show: boolean;
    title: string;
    message: string;
    confirmText: string;
    icon: string;
    type: 'danger' | 'primary';
    action: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    icon: 'help_outline',
    type: 'primary',
    action: () => {},
  });

  ngOnInit() {
    this.fetchUserDetails();
  }

  fetchUserDetails() {
    this.isLoading.set(true);
    this.adminService
      .getUserById(this.userId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.user.set(res.data);

          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          this.isLoading.set(false);
        },
      });
  }

  toggleUserLock() {
    const userVal = this.user();
    if (!userVal) return;

    const action = userVal.isActive ? this.adminService.lockUser(userVal.id) : this.adminService.unlockUser(userVal.id);
    action.subscribe({
      next: (response) => {
        if (response.success) {
          this.user.update(current => current ? { ...current, isActive: !current.isActive } : null);
        }
      },
      error: (err) => {
        console.error('Error toggling user lock:', err);
      }
    });
  }

  openDeleteConfirmation() {
    const userVal = this.user();
    if (!userVal) return;

    this.confirmDialog.set({
      show: true,
      title: 'Delete Manager',
      message: `Are you sure you want to permanently delete manager "${userVal.displayName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      icon: 'delete_forever',
      type: 'danger',
      action: () => {
        this.closeConfirm();
        this.isLoading.set(true);
        this.adminService.deleteManager(this.userId()).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.router.navigate(['/users']);
            }
          },
          error: (err) => {
            console.error('Error deleting manager:', err);
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  closeConfirm() {
    this.confirmDialog.update(state => ({ ...state, show: false }));
  }

  executeConfirm() {
    this.confirmDialog().action();
  }

  onUpdateSuccess(event: { displayName: string; stationId: string; stationName?: string }) {
    this.showUpdateManagerModal.set(false);
    this.user.update(current => current ? {
      ...current,
      displayName: event.displayName,
      stationId: event.stationId,
      stationName: event.stationName || current.stationName
    } : null);
    this.fetchUserDetails();
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}

