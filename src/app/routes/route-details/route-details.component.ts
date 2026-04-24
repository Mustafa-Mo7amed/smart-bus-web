import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { MicrobusAtStation, MicrobusOnTheWay, RouteDetails } from '../../shared/models/route.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-route-details',
  imports: [RouterOutlet],
  templateUrl: './route-details.component.html',
  styleUrl: './route-details.component.scss',
})
export class RouteDetailsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeService = inject(RouteService);
  readonly routeId = input.required<string>();

  routeDetails = signal<RouteDetails | null>(null);
  
  roadBuses = signal<MicrobusOnTheWay[]>([]);

  ngOnInit() {
    this.routeService
      .getRouteDetails(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (details) => {
          this.routeDetails.set(details);
        },
        // TODO: replace with some pop-up cards
        error: (error) => console.log('Error fetching route details:', error),
      });

    this.routeService
      .getMicrobusesOnTheWay(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (microbuses) => {
          this.roadBuses.set(microbuses);
        },
        // TODO: replace with some pop-up cards
        error: (error) => console.log('Error fetching road microbuses:', error),
      });
  }
}
