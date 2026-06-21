import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { UserInfo } from '../../shared/models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [MatIconModule, CommonModule],
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

  goBack() {
    this.router.navigate(['/users']);
  }
}
