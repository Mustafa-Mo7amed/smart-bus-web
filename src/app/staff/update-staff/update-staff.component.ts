import { Component, signal, inject, OnInit, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StaffService } from '../../core/services/staff.service';
import { UpdateStaffRequest, StaffListItem } from '../../shared/models/staff.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface ConfirmDialogState {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  icon: string;
  type?: 'danger' | 'primary';
  action: () => void;
}

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.toString().trim();
  if (!value) {
    return null;
  }
  const withoutSpaces = value.replace(/\s/g, '');
  const egPhoneRegex = /^01[0125]\d{8}$/;
  if (!egPhoneRegex.test(withoutSpaces)) {
    return { invalidEgyptianPhone: true };
  }
  return null;
}

@Component({
  selector: 'app-update-staff',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, ConfirmDialogComponent],
  templateUrl: './update-staff.component.html',
  styleUrl: './update-staff.component.scss',
})
export class UpdateStaffComponent implements OnInit {
  private readonly staffService = inject(StaffService);
  private readonly router = inject(Router);

  readonly staffId = input.required<string>();

  private initialStaff: StaffListItem | null = null;

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    phone: new FormControl('', {
      validators: [Validators.required, phoneValidator],
    }),
    isActive: new FormControl(true, {
      validators: [Validators.required],
    }),
  });

  submitted = signal(false);
  isSubmitting = signal(false);
  isLoading = signal(true);
  successMessage = signal('');
  errorMessage = signal('');

  confirmDialog = signal<ConfirmDialogState>({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    icon: 'help_outline',
    action: () => {},
  });

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { staff?: StaffListItem };
    if (state && state.staff) {
      this.initialStaff = state.staff;
    }
  }

  ngOnInit() {
    if (this.initialStaff) {
      this.populateForm(this.initialStaff);
    } else {
      // Fallback: fetch staff list and find the staff member by ID
      this.staffService.getStationStaff({ pageSize: 100 }).subscribe({
        next: (response) => {
          const member = response.data?.find((s) => s.id === this.staffId());
          if (member) {
            this.populateForm(member);
          } else {
            this.errorMessage.set('Staff member not found.');
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          console.error('Error fetching staff member:', error);
          this.errorMessage.set('Failed to load staff member details.');
          this.isLoading.set(false);
        },
      });
    }
  }

  private populateForm(member: StaffListItem) {
    this.form.patchValue({
      name: member.name,
      phone: member.phoneNumber,
      isActive: member.isActive,
    });
    this.isLoading.set(false);
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      return;
    }

    this.confirmDialog.set({
      show: true,
      title: 'Update Staff Member',
      message: 'Are you sure you want to update this staff member details?',
      confirmText: 'Update',
      icon: 'edit',
      action: () => this.executeUpdate(),
    });
  }

  executeUpdate() {
    this.closeConfirm();
    const formValues = this.form.value;
    const request: UpdateStaffRequest = {
      name: formValues.name!,
      phoneNumber: formValues.phone!,
      isActive: !!formValues.isActive,
    };

    this.isSubmitting.set(true);
    this.staffService.updateStaff(this.staffId(), request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.successMessage.set('Staff member updated successfully!');
          setTimeout(() => {
            this.router.navigate(['/staff']);
          }, 1500);
        } else {
          throw new Error('Failed to update staff member');
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating staff member:', error);
        this.errorMessage.set(error.error?.message || 'Failed to update staff member. Please try again.');
      },
    });
  }

  closeConfirm() {
    this.confirmDialog.update((state) => ({ ...state, show: false }));
  }

  executeConfirm() {
    this.confirmDialog().action();
  }

  goBack() {
    this.router.navigate(['/staff']);
  }
}
