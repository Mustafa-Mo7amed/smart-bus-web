import { inject, Injectable } from '@angular/core';
import { RouteApi } from '../api/route.api';
import { from, map, mergeMap, Observable, switchMap, toArray } from 'rxjs';
import { Route, RouteEndpoint } from '../../shared/models/route.model';

@Injectable({ providedIn: 'root' })
export class RouteService {
  routeApi = inject(RouteApi);

  getAllRoutes(): Observable<Route[]> {
    return this.routeApi.getAllRouteSources().pipe(
      switchMap((soures) => from(soures)),
      mergeMap((src) =>
        this.routeApi.getRouteDestinations(src.cityName!).pipe(
          switchMap((destinations) => from(destinations)),
          mergeMap((dest) =>
            this.routeApi.getRouteSummary(dest.routeId!).pipe(
              map((routeSummary) => ({
                startCity: src.cityName || '',
                endCity: dest.to || '',
                routeId: dest.routeId!,
                routeSummary,
              })),
            ),
          ),
        ),
      ),
      toArray(),
    );
  }
}
