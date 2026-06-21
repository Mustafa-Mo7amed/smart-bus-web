import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { plateNumberValidator } from '../../buses/add-bus/add-bus.component';
import { licenseNumberValidator } from '../../drivers/add-driver/add-driver.component';
import { DriverApi } from '../../core/api/driver.api';
import { BusApi } from '../../core/api/bus.api';
import { ManagerApi } from '../../core/api/manager.api';
import { BusSearchBy } from '../../shared/models/bus.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-assign-bus',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, QRCodeComponent],
  templateUrl: './assign-bus.component.html',
  styleUrl: './assign-bus.component.scss'
})
export class AssignBusComponent {
  private readonly router = inject(Router);
  private readonly driverApi = inject(DriverApi);
  private readonly busApi = inject(BusApi);
  private readonly managerApi = inject(ManagerApi);

  form = new FormGroup({
    licenseNumber: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(14), licenseNumberValidator],
    }),
    plateNumber: new FormControl('', {
      validators: [Validators.required, plateNumberValidator],
    }),
  });

  public num1 = signal('');
  public num2 = signal('');
  public num3 = signal('');
  public num4 = signal('');
  public let1 = signal('');
  public let2 = signal('');
  public let3 = signal('');

  submitted = signal(false);
  loading = signal(false);
  qrData = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onInput(event: Event, field: 'num1'|'num2'|'num3'|'num4'|'let1'|'let2'|'let3', current: HTMLInputElement, next: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    if (current.classList.contains('plate-input--digit')) {
      val = val.replace(/[^0-9]/g, '');
    } else {
      // val = val.replace(/[^أاإبجدرسصطعفقلمنهويى]/g, '');
      val = val.replace(/[^ء-ي]/g, '');
    }

    val = val.slice(0, 1);
    current.value = val;

    (this as any)[field].set(val);

    this.syncPlateValue();

    if (val && next) {
      next.focus();
      next.select();
    }
  }

  onKeydown(event: KeyboardEvent, current: HTMLInputElement, prev: HTMLInputElement | null, next: HTMLInputElement | null) {
    if (event.key === 'Backspace' && !current.value && prev) {
      prev.focus();
      prev.select();
      event.preventDefault();
    } else if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (prev) {
          prev.focus();
          prev.select();
          event.preventDefault();
        }
      } else {
        if (next) {
          next.focus();
          next.select();
          event.preventDefault();
        }
      }
    }
  }

  syncPlateValue() {
    const numbers = [this.num1(), this.num2(), this.num3(), this.num4()].filter(Boolean).join('');
    const letters = [this.let1(), this.let2(), this.let3()].filter(Boolean).join(' ');

    const plateVal = letters ? `${letters} ${numbers}` : numbers;
    this.form.get('plateNumber')?.setValue(plateVal);
    this.form.get('plateNumber')?.markAsTouched();
  }

  private clearPlateSignals() {
    this.num1.set('');
    this.num2.set('');
    this.num3.set('');
    this.num4.set('');
    this.let1.set('');
    this.let2.set('');
    this.let3.set('');
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      return;
    }

    const { licenseNumber, plateNumber } = this.form.value as { licenseNumber: string; plateNumber: string };
    this.loading.set(true);

    // Step 1 & 2: Search for driver by license number AND bus by plate number in parallel
    forkJoin({
      driver: this.driverApi.getDriverByLicense(licenseNumber),
      buses: this.busApi.getBuses({
        searchBy: BusSearchBy.PlateNumber,
        searchString: plateNumber,
        pageNumber: 1,
        pageSize: 1,
      }),
    }).subscribe({
      next: ({ driver, buses }) => {
        const driverId = driver?.data?.driverId;
        const bus = buses?.items?.[0];
        const microbusId = bus?.id;

        if (!driverId) {
          this.loading.set(false);
          this.errorMessage.set('Driver not found with the provided license number.');
          return;
        }

        if (!microbusId) {
          this.loading.set(false);
          this.errorMessage.set('Bus not found with the provided plate number.');
          return;
        }

        // Step 3: Assign driver to microbus
        this.managerApi.assignDriverBus({ driverId, microbusId }).subscribe({
          next: (response) => {
            this.loading.set(false);
            if (response.success && response.data) {
              this.qrData.set(response.data);
              this.successMessage.set(response.message || 'Driver assigned to microbus successfully!');
            } else {
              this.errorMessage.set(response.message || 'Assignment failed. Please try again.');
            }
          },
          error: (err) => {
            this.loading.set(false);
            const msg = err?.error?.message || err?.message || 'Failed to assign driver to bus. Please try again.';
            this.errorMessage.set(msg);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to look up driver or bus. Please check the details and try again.';
        this.errorMessage.set(msg);
      },
    });
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.qrData.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(false);
    this.clearPlateSignals();
  }

  printQR() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/assignments']);
  }
}
