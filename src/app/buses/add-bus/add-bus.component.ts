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
import { Route } from '../../shared/models/route.model';

export interface Microbus {
  id: string;
  plateNumber: string;
  model: string;
  color: string;
  capacity: number;
  qrCode: string;
  routeId: string;
  isActive: boolean;
}

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
  private routeService = inject(RouteService);

  routes = signal<Route[]>([]);

  // Dummy data simulating the DB
  buses: Microbus[] = [
    {
      id: 'b1c2d3e4-0001',
      plateNumber: 'أ ب ج 123',
      model: 'Toyota Hiace',
      color: 'White',
      capacity: 14,
      qrCode: 'QR-001',
      routeId: 'route1',
      isActive: true,
    },
    {
      id: 'b1c2d3e4-0002',
      plateNumber: 'د ه و 456',
      model: 'Hyundai H100',
      color: 'Silver',
      capacity: 12,
      qrCode: 'QR-002',
      routeId: 'route2',
      isActive: true,
    },
    {
      id: 'b1c2d3e4-0003',
      plateNumber: 'ز ح ط 789',
      model: 'Mitsubishi L300',
      color: 'Blue',
      capacity: 14,
      qrCode: 'QR-003',
      routeId: 'route3',
      isActive: false,
    },
  ];

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
    this.routeService.getAllRoutes().subscribe((routes: Route[]) => {
      this.routes.set(routes);
    });
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }
    const { plateNumber, model, color, capacity, qrCode, routeId } = this.form.value as any;
    const newBus: Microbus = {
      id: crypto.randomUUID(),
      plateNumber,
      model,
      color,
      capacity: Number(capacity),
      qrCode,
      routeId,
      isActive: true,
    };
    this.buses.unshift(newBus);
    this.successMessage.set(`Bus "${newBus.plateNumber}" registered successfully!`);
    this.form.reset();
    this.submitted.set(false);
    setTimeout(() => this.successMessage.set(''), 3000);
    console.log(this.successMessage());
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.successMessage.set('');
  }
}
