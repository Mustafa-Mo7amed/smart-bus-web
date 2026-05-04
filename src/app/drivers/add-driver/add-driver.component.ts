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

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
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
  // Dummy data simulating the DB
  drivers: Driver[] = [
    {
      id: 'a1b2c3d4-0001',
      name: 'Ahmed Hassan',
      phone: '01012345678',
      licenseNumber: 'LIC-001-EG',
      isActive: true,
    },
    {
      id: 'a1b2c3d4-0002',
      name: 'Mohamed Ali',
      phone: '01123456789',
      licenseNumber: 'LIC-002-EG',
      isActive: true,
    },
    {
      id: 'a1b2c3d4-0003',
      name: 'Youssef Kamal',
      phone: '01234567890',
      licenseNumber: 'LIC-003-EG',
      isActive: true,
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
    const newDriver: Driver = {
      id: crypto.randomUUID(),
      name,
      phone,
      licenseNumber,
      isActive: true,
    };

    this.drivers.unshift(newDriver);
    this.successMessage.set(`Driver "${newDriver.name}" registered successfully!`);
    this.form.reset();
    this.submitted.set(false);

    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
  }
}
