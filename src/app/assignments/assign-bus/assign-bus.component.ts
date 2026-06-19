import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { QRCodeComponent } from 'angularx-qrcode';
import { plateNumberValidator } from '../../buses/add-bus/add-bus.component';
import { licenseNumberValidator } from '../../drivers/add-driver/add-driver.component';

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
  qrData = signal<string | null>(null);

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
    this.clearPlateSignals();
  }

  printQR() {
    window.print();
  }
}
