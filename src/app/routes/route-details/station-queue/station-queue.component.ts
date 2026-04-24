import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { MicrobusAtStation } from '../../../shared/models/route.model';
import { RouteService } from '../../../core/services/route.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-station-queue',
  imports: [],
  templateUrl: './station-queue.component.html',
  styleUrl: './station-queue.component.scss',
})
export class StationQueueComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly destroyRef = inject(DestroyRef);
  routeId = input.required<string>();
  stationBuses = signal<MicrobusAtStation[]>([]);

  ngOnInit() {
    this.routeService
      .getMicrobusesAtStation(this.routeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (microbuses) => {
          this.stationBuses.set(microbuses);
          console.log(microbuses);
        },
        // TODO: replace with some pop-up cards
        error: (error) => console.log('Error fetching station microbuses:', error),
      });
  }
}
