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
import { RouteDetailed, RoutesPaginatedResponse } from '../../shared/models/route.model';
import { AddBusRequest } from '../../shared/models/bus.model';
import { BusService } from '../../core/services/bus.service';

function plateNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const withoutSpaces = value.replace(/\s/g, '');
  if (withoutSpaces.length !== 6 && withoutSpaces.length !== 7) {
    return { invalidPlateLength: true };
  }
  return null;
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

  private _routes = signal<RouteDetailed[] | null>(null);
  public routes = this._routes.asReadonly();

  form = new FormGroup({
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

  submitted = signal(false);
  successMessage = signal('');

  ngOnInit() {
    this.routeService.getAllRoutes().subscribe((routes: RouteDetailed[]) => {
      this._routes.set(routes);
    });
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }
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
        this.successMessage.set(`Bus "${newBus.plateNumber}" registered successfully!`);
        this.form.reset();
        this.submitted.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
        console.log(this.successMessage());
        console.log(response);
      },
      error: (error) => {
        console.error('Failed to add bus: ', error);
      },
    });
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
  }
}
