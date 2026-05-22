import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { MicrobusOnTheWay } from '../../../shared/models/route.model';
import { RouteService } from '../../../core/services/route.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-road-queue',
  imports: [],
  templateUrl: './road-queue.component.html',
  styleUrl: './road-queue.component.scss',
})
export class RoadQueueComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly destroyRef = inject(DestroyRef);
  routeId = input.required<string>();

  roadBuses = signal<MicrobusOnTheWay[]>([]);
  isLoading = false;

  ngOnInit() {
    this.isLoading = true;
    this.routeService
      .getMicrobusesOnTheWay(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
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
