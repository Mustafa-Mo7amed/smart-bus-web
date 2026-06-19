import { Component, DestroyRef, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import {
  RouteDetailed,
  RoutesPaginatedResponse,
  RouteSummary,
} from '../../shared/models/route.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink } from '@angular/router';
import { RoadQueueComponent } from './road-queue/road-queue.component';
import { MatIconModule } from '@angular/material/icon';
import { RouteTrackingSignalRService } from '../../core/services/signalr/route-tracking-signalr.service';
import { LocationSignalRService } from '../../core/services/signalr/location-signalr.service';
import { DriverService } from '../../core/services/driver.service';
import { RouteLiveUpdate, DriverLocationUpdate } from '../../shared/models/signalr.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-route-details',
  imports: [RouterOutlet, RoadQueueComponent, MatIconModule, RouterLink],
  templateUrl: './route-details.component.html',
  styleUrl: './route-details.component.scss',
})
export class RouteDetailsComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeService = inject(RouteService);
  private readonly routeTrackingService = inject(RouteTrackingSignalRService);
  private readonly locationSignalRService = inject(LocationSignalRService);
  private readonly driverService = inject(DriverService);
  readonly routeId = input.required<string>();

  route = signal<RouteDetailed | null>(null);
  routeLiveUpdate = signal<RouteLiveUpdate | null>(null);
  selectedDriverId = signal<string | null>(null);
  
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private destinationMarker: L.Marker | undefined;
  private polyline: L.Polyline | undefined;
  private lastKnownCoordinates: [number, number] | undefined;
  private lastKnownPath: [number, number][] | undefined;
  private isInitialLoad = true;

  async ngOnInit() {
    this.routeService
      .getRouteById(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (route) => {
          this.route.set(route);
        },
        error: (error) => console.log('Error fetching route details:', error),
      });

    this.routeService
      .getRouteSummary(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.routeLiveUpdate.set({
            numberOfMicrobusesInQueue: summary.numberOfMicrobusesInQueue,
            numberOfMicrobusesOnTheWay: summary.numberOfMicrobusesOnTheWay,
            nearestArrivalMinutes: summary.nearestArrivalMinutes,
          });
        },
        error: (error) => console.log('Error fetching initial route summary:', error),
      });

    await this.routeTrackingService.joinRoute(this.routeId());
    this.routeTrackingService.routeUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update: RouteLiveUpdate) => {
        this.routeLiveUpdate.set(update);
      });

    this.locationSignalRService.locationReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update: DriverLocationUpdate) => {
        this.updateMapWithLocation(update);
      });
  }

  async onDriverSelected(driverId: string) {
    if (this.selectedDriverId() === driverId) {
      this.selectedDriverId.set(null);
      await this.locationSignalRService.leaveDriver();
      this.clearMap();
      return;
    }
    this.selectedDriverId.set(driverId);
    this.isInitialLoad = true; // Reset flag for new driver
    this.initMapIfNeeded();

    // Fetch initial location from DriverService API
    this.driverService.getDriverLocation(driverId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (location: DriverLocationUpdate) => {
          this.updateMapWithLocation(location);
        },
        error: (err) => console.log('Error fetching initial driver location:', err),
      });

    await this.locationSignalRService.joinDriver(driverId);
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

  private clearMap() {
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
    if (this.destinationMarker) {
      this.destinationMarker.remove();
      this.destinationMarker = undefined;
    }
    if (this.polyline) {
      this.polyline.remove();
      this.polyline = undefined;
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

    if (path.length > 1) {
      const destinationLocation = path[path.length - 1];
      if (!this.destinationMarker) {
        const svgDestIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
        const destIcon = L.divIcon({
          className: 'custom-destination-marker',
          html: `<div class="marker-core">${svgDestIcon}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        this.destinationMarker = L.marker(destinationLocation, { icon: destIcon }).addTo(this.map!);
      } else {
        this.destinationMarker.setLatLng(destinationLocation);
      }
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

  async ngOnDestroy() {
    await this.routeTrackingService.leaveRoute();
    if (this.selectedDriverId()) {
      await this.locationSignalRService.leaveDriver();
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
