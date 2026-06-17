import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { RouteDetails } from '../../shared/models/route.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink } from "@angular/router";
import { RoadQueueComponent } from "./road-queue/road-queue.component";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-route-details',
  imports: [RouterOutlet, RoadQueueComponent, MatIconModule, RouterLink],
  templateUrl: './route-details.component.html',
  styleUrl: './route-details.component.scss',
})
export class RouteDetailsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeService = inject(RouteService);
  readonly routeId = input.required<string>();

  routeDetails = signal<RouteDetails | null>(null);

  ngOnInit() {
    this.routeService
      .getRouteDetails(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (details) => {
          this.routeDetails.set(details);
        },
        error: (error) => console.log('Error fetching route details:', error),
      });
  }
}
