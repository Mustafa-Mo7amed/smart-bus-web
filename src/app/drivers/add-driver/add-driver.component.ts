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

export interface Driver {
  id: string;
  driverId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'Active' | 'Inactive';
}

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

  // Local dummy data list (shared in memory for this session)
  drivers: Driver[] = [
    {
      id: '1',
      driverId: 'DRV-1024',
      name: 'Ahmed Hassan',
      phone: '01012345678',
      licenseNumber: 'LIC-001-EG',
      status: 'Active',
    },
  ];

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
    
    const driverId = `DRV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDriver: Driver = {
      id: crypto.randomUUID(),
      driverId: driverId,
      name,
      phone,
      licenseNumber,
      status: 'Active',
    };

    // In a real app with dummy data, we'd push to a service
    this.drivers.unshift(newDriver);
    
    this.successMessage.set(`Driver "${newDriver.name}" registered successfully!`);
    this.form.reset();
    this.submitted.set(false);

    setTimeout(() => {
      this.successMessage.set('');
      this.router.navigate(['/drivers']);
    }, 2000);
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
