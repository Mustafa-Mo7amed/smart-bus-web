import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthApi } from '../../../core/api/auth.api';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.scss',
})
export class ResetPasswordModalComponent {
  private readonly authApi = inject(AuthApi);

  show = input.required<boolean>();
  userId = input.required<string>();
  displayName = input.required<string>();
  phoneNumber = input.required<string>();

  close = output<void>();
  success = output<void>();

  step = signal<'send' | 'verify' | 'success'>('send');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  otp = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  sendOtp() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authApi.forgetPassword(this.phoneNumber()).subscribe({
      next: () => {
        this.step.set('verify');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to send OTP. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  resetForm() {
    this.step.set('send');
    this.otp.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.errorMessage.set(null);
  }

  onSubmit() {
    if (!this.otp().trim()) {
      this.errorMessage.set('OTP is required');
      return;
    }
    if (!this.newPassword()) {
      this.errorMessage.set('New password is required');
      return;
    }
    if (this.newPassword().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Step 1: Verify OTP
    this.authApi.verifyOtp(this.phoneNumber(), this.otp()).subscribe({
      next: (verifyRes) => {
        if (verifyRes.success && verifyRes.data?.token) {
          // Step 2: Reset Password
          this.authApi
            .resetPassword({
              userId: verifyRes.data.userId || this.userId(),
              token: verifyRes.data.token,
              newPassword: this.newPassword(),
              confirmPassword: this.confirmPassword(),
            })
            .subscribe({
              next: (resetRes) => {
                this.isLoading.set(false);
                if (resetRes.success) {
                  this.step.set('success');
                  this.success.emit();
                } else {
                  this.errorMessage.set(resetRes.message || 'Failed to reset password.');
                }
              },
              error: (resetErr) => {
                this.errorMessage.set(
                  resetErr.error?.message || 'Failed to reset password. Please check requirements.'
                );
                this.isLoading.set(false);
              },
            });
        } else {
          this.errorMessage.set(verifyRes.message || 'OTP verification failed.');
          this.isLoading.set(false);
        }
      },
      error: (verifyErr) => {
        this.errorMessage.set(verifyErr.error?.message || 'Invalid or expired OTP.');
        this.isLoading.set(false);
      },
    });
  }

  onCancel() {
    this.resetForm();
    this.close.emit();
  }
}
