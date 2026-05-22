import { inject, Injectable } from '@angular/core';
import { RouteApi } from '../api/route.api';
import { from, map, mergeMap, Observable, switchMap, toArray } from 'rxjs';
import {
  MicrobusAtStation,
  MicrobusOnTheWay,
  Route,
  RouteDetails,
} from '../../shared/models/route.model';

@Injectable({ providedIn: 'root' })
export class RouteService {
  routeApi = inject(RouteApi);

  getAllRoutes(): Observable<Route[]> {
    return this.routeApi.getAllRouteSources().pipe(
      switchMap((sources) => from(sources)),
      mergeMap((src) => {
        return this.routeApi.getRouteDestinations(src.stationId!).pipe(
          switchMap((destinations) => from(destinations)),
          mergeMap((dest) => {
            return this.routeApi.getRouteSummary(dest.routeId!).pipe(
              map((routeSummary) => ({
                startCity: src.cityName || '',
                endCity: dest.to || '',
                routeId: dest.routeId!,
                routeSummary,
              })),
            );
          }),
        );
      }),
      toArray(),
    );
  }

  getRouteDetails(routeId: string): Observable<RouteDetails> {
    return this.routeApi.getRouteDetails(routeId);
  }

  getMicrobusesAtStation(routeId: string): Observable<MicrobusAtStation[]> {
    return this.routeApi.getMicrobusesAtStation(routeId).pipe(
      map((buses) =>
        [...buses].sort((a, b) => {
          return a.position - b.position;
        }),
      ),
    );
  }

  getMicrobusesOnTheWay(routeId: string): Observable<MicrobusOnTheWay[]> {
    return this.routeApi.getMicrobusesOnTheWay(routeId).pipe(
      map((buses) =>
        [...buses].sort((a, b) => {
          return a.position - b.position;
        }),
      ),
    );
  }
}
