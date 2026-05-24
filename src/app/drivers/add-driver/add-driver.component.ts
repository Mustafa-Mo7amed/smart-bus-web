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

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const withoutSpaces = value.replace(/\s/g, '');
  if (withoutSpaces.length < 10) {
    return { invalidPhoneLength: true };
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
      validators: [Validators.required, Validators.maxLength(50)],
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
