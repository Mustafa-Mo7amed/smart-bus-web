import { Component, signal, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StaffService } from '../../core/services/staff.service';
import { AddStaffRequest } from '../../shared/models/staff.model';

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

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIcon],
  templateUrl: './add-staff.component.html',
  styleUrl: './add-staff.component.scss',
})
export class AddStaffComponent {
  private readonly router = inject(Router);
  private readonly staffService = inject(StaffService);

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    phone: new FormControl('', {
      validators: [Validators.required, phoneValidator],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required],
    }),
  }, {
    validators: passwordMatchValidator,
  });

  submitted = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { name, phone, password } = this.form.value as any;
    const newStaff: AddStaffRequest = {
      name,
      phoneNumber: phone,
      password,
    };

    this.staffService.addStaff(newStaff).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.successMessage.set(`Staff member "${newStaff.name}" registered successfully!`);
          this.form.reset();
          this.submitted.set(false);
        } else {
          throw new Error('Failed to add staff member');
        }
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Something went wrong! Please try again later.');
        this.isSubmitting.set(false);
      },
    });
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  goBack() {
    this.router.navigate(['/staff']);
  }
}
