import { Component, signal, inject, OnInit, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { RouteService } from '../../core/services/route.service';
import { RouteDetailed } from '../../shared/models/route.model';
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

@Component({
  selector: 'app-update-route',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './update-route.component.html',
  styleUrl: './update-route.component.scss',
})
export class UpdateRouteComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly router = inject(Router);

  readonly routeId = input.required<string>();

  public route = signal<RouteDetailed | null>(null);
  public form = new FormGroup({
    toAr: new FormControl('', {
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[\u0600-\u06FF\s0-9\-\.\,]+$/)
      ],
    }),
    toEn: new FormControl('', {
      validators: [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s0-9\-\.\,]+$/)
      ],
    }),
    price: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    distanceKm: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  public submitted = signal(false);
  public isSubmitting = signal(false);
  public isLoading = signal(true);
  public successMessage = signal('');
  public errorMessage = signal('');

  // Confirmation dialog state
  public confirmDialog = signal<ConfirmDialogState>({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    icon: 'help_outline',
    action: () => {},
  });

  ngOnInit() {
    this.routeService.getRouteById(this.routeId()).subscribe({
      next: (route) => {
        this.route.set(route);
        this.form.patchValue({
          toAr: route.to,
          toEn: route.to,
          price: route.price,
          distanceKm: route.distanceKm,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching route details:', error);
        this.errorMessage.set('Failed to load route details.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      return;
    }

    // Show confirmation dialog before updating
    this.confirmDialog.set({
      show: true,
      title: 'Update Route',
      message: 'Are you sure you want to update this route with the new details?',
      confirmText: 'Update',
      icon: 'edit',
      action: () => this.executeRouteUpdate(),
    });
  }

  executeRouteUpdate() {
    this.closeConfirm();
    const formValues = this.form.value;
    const request = {
      routeId: this.routeId(),
      toAr: formValues.toAr!,
      toEn: formValues.toEn!,
      price: formValues.price!,
      distanceKm: formValues.distanceKm!,
    };

    this.isSubmitting.set(true);
    this.routeService.updateRoute(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Route updated successfully!');
        setTimeout(() => {
          this.router.navigate(['/routes']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating route:', error);
        
        // Handle server validation errors
        if (error.status === 400 && error.error && error.error.errors) {
          const validationErrors = error.error.errors;
          for (const key of Object.keys(validationErrors)) {
            const formKey = key.charAt(0).toLowerCase() + key.slice(1);
            const control = this.form.get(formKey);
            if (control) {
              control.setErrors({ serverError: validationErrors[key][0] });
            }
          }
          this.errorMessage.set('Please fix the validation errors below.');
        } else {
          this.errorMessage.set(error.error?.message || 'Failed to update route. Please try again.');
        }
      },
    });
  }

  closeConfirm() {
    this.confirmDialog.update((state) => ({ ...state, show: false }));
  }

  executeConfirm() {
    this.confirmDialog().action();
  }
}
