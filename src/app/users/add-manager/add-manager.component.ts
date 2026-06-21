import { Component, OnInit, signal, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AddManagerRequest } from '../../shared/models/user.model';
import { AdminService } from '../../core/services/admin.service';
import { phoneValidator } from '../../drivers/add-driver/add-driver.component';
import { StationService } from '../../core/services/station.service';

@Component({
  selector: 'app-add-manager',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIcon],
  templateUrl: './add-manager.component.html',
  styleUrl: './add-manager.component.scss',
})
export class AddManagerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly stationService = inject(StationService);

  stations = signal<{ stationId: string; cityName: string }[]>([]);

  form = new FormGroup({
    displayName: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    phone: new FormControl('', {
      validators: [Validators.required, phoneValidator],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
    stationId: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  submitted = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  showPassword = signal(false);

  ngOnInit() {
    this.stationService.getStations().subscribe({
      next: (res) => {
        const list = res
          .filter(x => x.id && x.name)
          .map(x => ({ stationId: x.id, cityName: x.name }));
        
        this.stations.set(list);
      },
      error: (err) => {
        console.error('Error fetching stations:', err);
      }
    });
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { displayName, phone, password, stationId } = this.form.value as any;
    const newManager: AddManagerRequest = {
      displayName: displayName,
      phoneNumber: phone,
      password: password,
      stationId: stationId,
    };
    this.adminService.addManager(newManager).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.successMessage.set(`Manager "${newManager.displayName}" registered successfully!`);
          this.form.reset();
          this.submitted.set(false);

          setTimeout(() => {
            this.successMessage.set('');
            this.goBack();
          }, 2000);
        } else {
          throw new Error('failed to add manager');
        }
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(error?.error?.message || 'Something went wrong! Please try again later.');
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

  goBack() {
    this.router.navigate(['/users']);
  }

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }
}
