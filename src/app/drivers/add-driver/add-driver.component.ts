import { Component, OnInit, signal, inject } from '@angular/core';
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
import { AddDriverRequest } from '../../shared/models/driver.model';
import { DriverService } from '../../core/services/driver.service';

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

export function licenseNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.toString().trim();

  if (!value) {
    return null;
  }

  if (!((value[0] == 2 || value[0] == 3) && value.length == 14)) {
    return { invalidLicenseNumber: true };
  }

  const century = value[0] === '2' ? 1900 : 2000;
  const year = century + Number(value.substring(1, 3));
  const month = Number(value.substring(3, 5));
  const day = Number(value.substring(5, 7));

  const date = new Date(year, month - 1, day);

  const isValidDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!isValidDate) {
    return { invalidBirthDate: true };
  }

  return null;
}

@Component({
  selector: 'app-add-driver',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIcon],
  templateUrl: './add-driver.component.html',
  styleUrl: './add-driver.component.scss',
})
export class AddDriverComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly driverService = inject(DriverService);

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    phone: new FormControl('', {
      validators: [Validators.required, phoneValidator],
    }),
    licenseNumber: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50), licenseNumberValidator],
    }),
  });

  submitted = signal(false);
  successMessage = signal('');

  ngOnInit() {
    // Initialize any data if needed
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    const { name, phone, licenseNumber } = this.form.value as any;
    const newDriver: AddDriverRequest = {
      driverName: name,
      phoneNumber: phone,
      licenseNumber,
    };
    this.driverService.addDriver(newDriver).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set(`Driver "${newDriver.driverName}" registered successfully!`);
          this.form.reset();
          this.submitted.set(false);

          setTimeout(() => {
            this.successMessage.set('');
            this.goBack();
          }, 2000);
        } else {
          throw 'failed to add driver';
        }
      },
      error: (error) => {
        console.error(error);
        this.successMessage.set('Something went wrong! Please try again later.');
        this.form.reset();
        this.submitted.set(false);
        console.log('AddDriverError: ', error);
      },
    });
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
  }

  goBack() {
    this.router.navigate(['/drivers']);
  }
}
