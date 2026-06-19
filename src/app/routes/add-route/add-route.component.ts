import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, RouterLink],
  templateUrl: './add-route.component.html',
  styleUrl: './add-route.component.scss',
})
export class AddRouteComponent {
  public form = new FormGroup({
    fromAr: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    fromEn: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    toAr: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    toEn: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    price: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    distanceKm: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  public submitted = signal(false);
  public successMessage = signal('');

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }
    console.log('Form Submitted', this.form.value);
    this.successMessage.set('Route added successfully! (UI Only)');
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
  }
}
