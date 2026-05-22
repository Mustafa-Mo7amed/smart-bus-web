import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-assign-bus',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, QRCodeComponent],
  templateUrl: './assign-bus.component.html',
  styleUrl: './assign-bus.component.scss'
})
export class AssignBusComponent {
  form = new FormGroup({
    licenseNumber: new FormControl('', {
      validators: [Validators.required],
    }),
    plateNumber: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  submitted = signal(false);
  qrData = signal<string | null>(null);

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    const { licenseNumber, plateNumber } = this.form.value as any;
    // Mock an API call and set QR data
    const data = {
      license: licenseNumber,
      plate: plateNumber,
      timestamp: new Date().toISOString()
    };
    this.qrData.set(JSON.stringify(data));
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.qrData.set(null);
  }

  printQR() {
    window.print();
  }
}
