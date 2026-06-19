import { Component, DestroyRef, inject, input, output, OnInit, signal } from '@angular/core';
import { MicrobusOnTheWay } from '../../../shared/models/route.model';
import { RouteService } from '../../../core/services/route.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouteTrackingSignalRService } from '../../../core/services/signalr/route-tracking-signalr.service';
import { delay } from 'rxjs';

@Component({
  selector: 'app-road-queue',
  imports: [],
  templateUrl: './road-queue.component.html',
  styleUrl: './road-queue.component.scss',
})
export class RoadQueueComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly routeTrackingService = inject(RouteTrackingSignalRService);
  private readonly destroyRef = inject(DestroyRef);
  routeId = input.required<string>();
  selectedDriverId = input<string | null>(null);
  driverSelected = output<string>();

  roadBuses = signal<MicrobusOnTheWay[]>([]);
  isLoading = false;

  ngOnInit() {
    this.fetchMicrobusesOnTheWay(0);

    this.routeTrackingService.routeUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update) => {
        this.fetchMicrobusesOnTheWay(100);
      });
  }

  private fetchMicrobusesOnTheWay(delayTime: number) {
    this.isLoading = true;
    this.routeService
      .getMicrobusesOnTheWay(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef), delay(delayTime))
      .subscribe({
        next: (microbuses) => {
          this.roadBuses.set(microbuses);
          this.isLoading = false;
        },
        // TODO: replace with some pop-up cards
        error: (error) => {
          console.log('Error fetching road microbuses:', error);
          this.isLoading = false;
        },
      });
  }
}
