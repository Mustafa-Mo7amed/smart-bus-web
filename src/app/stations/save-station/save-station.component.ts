import { Component, OnInit, signal, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { StationService } from '../../core/services/station.service';
import { SaveStationRequest } from '../../shared/models/station.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-save-station',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './save-station.component.html',
  styleUrl: './save-station.component.scss',
})
export class SaveStationComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly stationService = inject(StationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  stationId = signal<string | null>(null);
  isEditMode = signal(false);

  form = new FormGroup({
    nameAr: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    nameEn: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    cityAr: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    cityEn: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    addressAr: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    addressEn: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    latitude: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    longitude: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    isActive: new FormControl(true, {
      nonNullable: true,
    }),
  });

  submitted = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('stationId');
    if (id) {
      this.stationId.set(id);
      this.isEditMode.set(true);
      this.fetchStationDetails(id);
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  fetchStationDetails(id: string) {
    this.isSubmitting.set(true);
    this.stationService.getStationById(id).subscribe({
      next: (station) => {
        this.form.patchValue({
          nameAr: station.name,
          nameEn: station.name,
          cityAr: station.city,
          cityEn: station.city,
          addressAr: station.address,
          addressEn: station.address,
          latitude: station.lat,
          longitude: station.lng,
          isActive: true,
        });
        
        if (this.map && station.lat && station.lng) {
          this.updateMarkerPosition(station.lat, station.lng);
          this.map.setView([station.lat, station.lng], 15);
        }
        
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error fetching station details:', err);
        this.errorMessage.set('Failed to load station details.');
        this.isSubmitting.set(false);
      },
    });
  }

  initMap() {
    this.map = L.map('station-map', {
      zoomControl: true,
      attributionControl: false,
    }).setView([30.0444, 31.2357], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.updateMarkerPosition(lat, lng);
    });

    const lat = this.form.value.latitude;
    const lng = this.form.value.longitude;
    if (lat && lng) {
      this.updateMarkerPosition(lat, lng);
      this.map.setView([lat, lng], 15);
    }
  }

  updateMarkerPosition(lat: number, lng: number) {
    this.form.patchValue({
      latitude: Number(lat.toFixed(7)),
      longitude: Number(lng.toFixed(7)),
    });

    const stationSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
    const markerIcon = L.divIcon({
      className: 'custom-station-marker',
      html: `<div class="marker-core" style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">${stationSvg}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else if (this.map) {
      this.marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.form.patchValue({
          latitude: Number(pos.lat.toFixed(7)),
          longitude: Number(pos.lng.toFixed(7)),
        });
      });
    }
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const request: SaveStationRequest = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      cityAr: this.form.value.cityAr!,
      cityEn: this.form.value.cityEn!,
      addressAr: this.form.value.addressAr!,
      addressEn: this.form.value.addressEn!,
      latitude: this.form.value.latitude!,
      longitude: this.form.value.longitude!,
      isActive: this.form.value.isActive!,
    };

    const action = this.isEditMode()
      ? this.stationService.updateStation(this.stationId()!, request)
      : this.stationService.addStation(request);

    action.subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successMessage.set(
          this.isEditMode() ? 'Station updated successfully!' : 'Station created successfully!'
        );
        this.form.reset();
        this.submitted.set(false);
        if (this.marker) {
          this.marker.remove();
          this.marker = undefined;
        }

        setTimeout(() => {
          this.successMessage.set('');
          this.goBack();
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving station:', err);
        this.errorMessage.set(err?.error?.message || 'Something went wrong. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  onReset() {
    this.form.reset({
      isActive: true,
    });
    this.submitted.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
  }

  goBack() {
    this.router.navigate(['/stations']);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
