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
import { RouteLiveUpdate } from '../../shared/models/signalr.model';

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
  readonly routeId = input.required<string>();

  route = signal<RouteDetailed | null>(null);
  routeLiveUpdate = signal<RouteLiveUpdate | null>(null);

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
  }

  async ngOnDestroy() {
    await this.routeTrackingService.leaveRoute();
  }
}
