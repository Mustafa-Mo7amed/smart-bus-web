import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/services/driver.service';
import { GetDriverModel, DriverHistoryResponse, TripStatus } from '../../shared/models/driver.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { LocationSignalRService } from '../../core/services/signalr/location-signalr.service';
import { DriverLocationUpdate } from '../../shared/models/signalr.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule, PaginatorComponent],
  templateUrl: './driver-details.component.html',
  styleUrl: './driver-details.component.scss',
})
export class DriverDetailsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly driverService = inject(DriverService);
  private readonly locationSignalRService = inject(LocationSignalRService);

  readonly driverId = input.required<string>();

  driver = signal<GetDriverModel | null>(null);
  tripHistory = signal<DriverHistoryResponse | null>(null);
  TripStatus = TripStatus;

  fromDate = signal<string>('');
  toDate = signal<string>('');

  pageIndex = signal(0);
  pageSize = signal(5);
  pageSizeOptions = signal<number[]>([5, 10, 20, 50]);

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private polyline: L.Polyline | undefined;
  private lastKnownCoordinates: [number, number] | undefined;
  private lastKnownPath: [number, number][] | undefined;
  private isInitialLoad = true;

  async ngOnInit() {
    this.driverService
      .getDriverById(this.driverId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.driver.set(res.data);
        },
        error: (error) => console.log('Error fetching driver details:', error),
      });

    this.fetchTripHistory();

    this.isInitialLoad = true;
    this.initMapIfNeeded();

    this.driverService.getDriverLocation(this.driverId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (location: DriverLocationUpdate) => {
          this.updateMapWithLocation(location);
        },
        error: (err) => console.log('Error fetching initial driver location:', err),
      });

    await this.locationSignalRService.joinDriver(this.driverId());

    this.locationSignalRService.locationReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update: DriverLocationUpdate) => {
        this.updateMapWithLocation(update);
      });
  }

  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  reCenter() {
    if (this.map) {
      if (this.lastKnownPath && this.lastKnownPath.length > 1) {
        this.map.flyToBounds(this.lastKnownPath, { padding: [50, 50], duration: 1.2 });
      } else if (this.lastKnownCoordinates) {
        this.map.flyTo(this.lastKnownCoordinates, 16, { duration: 1.2 });
      }
    }
  }

  private initMapIfNeeded() {
    if (!this.map) {
      this.map = L.map('tracking-map', {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.0444, 31.2357], 13); // Default view Cairo

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(this.map);
    }
  }

  private updateMapWithLocation(update: DriverLocationUpdate) {
    this.initMapIfNeeded();

    if (!update.coordinates || update.coordinates.length === 0) return;

    // Convert coordinates to Leaflet LatLng format
    const path = update.coordinates.map(c => [c[1], c[0]] as [number, number]);
    const currentLocation = path[0];

    this.lastKnownCoordinates = currentLocation;
    this.lastKnownPath = path;

    if (!this.marker) {
      const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`;
      const icon = L.divIcon({
        className: 'custom-bus-marker',
        html: `<div class="marker-pulse"></div><div class="marker-core">${svgIcon}</div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      this.marker = L.marker(currentLocation, { icon }).addTo(this.map!);
    } else {
      this.marker.setLatLng(currentLocation);
    }

    if (!this.polyline) {
      this.polyline = L.polyline(path, { color: '#00c2a8', weight: 5, opacity: 0.7 }).addTo(this.map!);
    } else {
      this.polyline.setLatLngs(path);
    }

    if (this.isInitialLoad) {
      if (path.length > 1) {
        this.map?.flyToBounds(path, { padding: [50, 50], duration: 1.5 });
      } else {
        this.map?.flyTo(currentLocation, 16, { duration: 1.5 });
      }
      this.isInitialLoad = false;
    }
  }

  fetchTripHistory() {
    let fDate = this.fromDate();
    let tDate = this.toDate();

    if (!fDate) {
      fDate = '0001-01-01T00:00:00+00:00';
    } else {
      // Create local date, then parse to ISO to send standard timezone offset
      fDate = new Date(fDate).toISOString();
    }

    if (!tDate) {
      tDate = '9999-12-31T23:59:59+00:00';
    } else {
      tDate = new Date(tDate).toISOString();
    }

    console.log('from: ', fDate);
    console.log('to: ', tDate);

    this.driverService
      .getDriverTripHistory(this.driverId(), {
        fromDate: fDate,
        toDate: tDate,
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize()
      })
      .subscribe({
        next: (res) => this.tripHistory.set(res),
        error: (error) => console.log('Error fetching driver history:', error),
      });
  }

  onDateFilterChange() {
    this.pageIndex.set(0);
    this.fetchTripHistory();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.fetchTripHistory();
  }

  async ngOnDestroy() {
    await this.locationSignalRService.leaveDriver();
    if (this.map) {
      this.map.remove();
    }
  }

  getTripStatusString(status: TripStatus): string {
    switch (status) {
      case TripStatus.started: return 'Started';
      case TripStatus.completed: return 'Completed';
      case TripStatus.canceled: return 'Canceled';
      default: return 'Unknown';
    }
  }
}
