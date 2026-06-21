import { Component, signal, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { RouteService } from '../../core/services/route.service';
import { StationService } from '../../core/services/station.service';
import { StationInfo } from '../../shared/models/station.model';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, RouterLink],
  templateUrl: './add-route.component.html',
  styleUrl: './add-route.component.scss',
})
export class AddRouteComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly stationService = inject(StationService);
  private readonly router = inject(Router);

  public stations = signal<StationInfo[]>([]);
  public form = new FormGroup({
    toStationId: new FormControl('', {
      validators: [Validators.required],
    }),
    price: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    distanceKm: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  public submitted = signal(false);
  public isSubmitting = signal(false);
  public successMessage = signal('');
  public errorMessage = signal('');

  ngOnInit() {
    this.stationService.getStations().subscribe({
      next: (stations) => {
        this.stations.set(stations);
      },
      error: (error) => {
        console.error('Error fetching stations:', error);
      }
    });
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      return;
    }

    const formValues = this.form.value;
    const request = {
      toStationId: formValues.toStationId!,
      price: formValues.price!,
      distanceKm: formValues.distanceKm!,
    };

    this.isSubmitting.set(true);
    this.routeService.addRoute(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successMessage.set(response.message || 'Route created successfully!');
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error adding route:', error);
        this.errorMessage.set('Failed to create route. Please try again.');
      },
    });
  }

  onReset() {
    this.form.reset({
      toStationId: '',
      price: null,
      distanceKm: null
    });
    this.submitted.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
