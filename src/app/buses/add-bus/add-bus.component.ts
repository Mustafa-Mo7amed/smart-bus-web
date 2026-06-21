// AddBusComponent with Reactive Forms
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
import { RouteService } from '../../core/services/route.service';
import { RouteDetailed } from '../../shared/models/route.model';
import { AddBusRequest } from '../../shared/models/bus.model';
import { BusService } from '../../core/services/bus.service';
import { Router } from '@angular/router';

export function plateNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null; // Let the 'required' validator handle empty values

  // The 17 allowed Arabic letters
  // const allowedLetters = '[أاإبجدرسصطعفقلمنهويى]';
  const allowedLetters = '[ء-ي]';
  const digit = '\\d';

  // Cairo: 3 Letters, 3 Numbers (e.g., "أ ب ج 123")
  const cairoRegex = new RegExp(`^${allowedLetters} ${allowedLetters} ${allowedLetters} ${digit}{3}$`);
  
  // Giza: 2 Letters, 4 Numbers (e.g., "أ ب 1234")
  const gizaRegex = new RegExp(`^${allowedLetters} ${allowedLetters} ${digit}{4}$`);

  // Other Governorates: 3 Letters, 4 Numbers (e.g., "أ ب ج 1234")
  const otherRegex = new RegExp(`^${allowedLetters} ${allowedLetters} ${allowedLetters} ${digit}{4}$`);

  if (cairoRegex.test(value) || gizaRegex.test(value) || otherRegex.test(value)) {
    return null;
  }

  return { invalidEgyptianPlate: true };
}

@Component({
  selector: 'app-add-bus',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIcon],
  templateUrl: './add-bus.component.html',
  styleUrl: './add-bus.component.scss',
})
export class AddBusComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly busService = inject(BusService);
  private readonly router = inject(Router);

  private _routes = signal<RouteDetailed[] | null>(null);
  public routes = this._routes.asReadonly();

  public form = new FormGroup({
    plateNumber: new FormControl('', {
      validators: [Validators.required, plateNumberValidator],
    }),
    model: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    color: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    capacity: new FormControl('', {
      validators: [Validators.required, Validators.min(1), Validators.max(50)],
    }),
    routeId: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  public num1 = signal('');
  public num2 = signal('');
  public num3 = signal('');
  public num4 = signal('');
  public let1 = signal('');
  public let2 = signal('');
  public let3 = signal('');

  public submitted = signal(false);
  public successMessage = signal('');
  public errorMessage = signal('');
  public isSubmitting = signal(false);

  ngOnInit() {
    this.routeService.getAllRoutes().subscribe((routes: RouteDetailed[]) => {
      this._routes.set(routes);
    });
  }

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

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { plateNumber, model, color, capacity, routeId } = this.form.value as any;
    const newBus: AddBusRequest = {
      plateNumber,
      model,
      color,
      passengerCount: Number(capacity),
      routeId,
    };
    this.busService.addBus(newBus).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Bus "${newBus.plateNumber}" registered successfully!`);
        this.form.reset();
        this.submitted.set(false);
        this.clearPlateSignals();
        setTimeout(() => {
          this.successMessage.set('');
          this.goBack();
        }, 2000);
        console.log(this.successMessage());
        console.log(response);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Failed to register the bus. Please try again.');
        console.error('Failed to add bus: ', error);
      },
    });
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

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.clearPlateSignals();
  }

  goBack() {
    this.router.navigate(['/buses']);
  }
}
