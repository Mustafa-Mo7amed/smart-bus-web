import { inject, Injectable } from '@angular/core';
import { RouteApi } from '../api/route.api';
import {
  delay,
  from,
  interval,
  map,
  mergeMap,
  Observable,
  switchMap,
  toArray,
  zipWith,
} from 'rxjs';
import {
  MicrobusAtStation,
  MicrobusOnTheWay,
  RouteDetailed,
  RouteDetails,
  RouteSummary,
} from '../../shared/models/route.model';
import { RouteListItem } from '../../routes/routes-list/routes-list.component';

@Injectable({ providedIn: 'root' })
export class RouteService {
  routeApi = inject(RouteApi);

  getAllRoutes(): Observable<RouteDetailed[]> {
    return this.routeApi.getRoutesPaginated(1, 10000).pipe(map((response) => response.data.data));
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

  getRouteSummary(routeId: string): Observable<RouteSummary> {
    return this.routeApi.getRouteSummary(routeId);
  }

  getAllRouteListItems(): Observable<RouteListItem[]> {
    return this.getAllRoutes().pipe(
      switchMap((routes) => from(routes)),
      zipWith(interval(1000 / 10)),
      mergeMap(
        ([route]) =>
          this.getRouteSummary(route.id).pipe(
            map((summary) => {
              return {
                details: route,
                numberOfMicrobusesInQueue: summary.numberOfMicrobusesInQueue,
                numberOfMicrobusesOnTheWay: summary.numberOfMicrobusesOnTheWay,
                nearestArrivalMinutes: summary.nearestArrivalMinutes,
              };
            }),
          ),
      ),
      toArray(),
    );
  }

  getRouteListItems(
    pageNumber: number,
    pageSize: number,
  ): Observable<{ data: RouteListItem[]; totalCount: number }> {
    return this.routeApi.getRoutesPaginated(pageNumber, pageSize).pipe(
      switchMap((response) => {
        const routes = response.data.data;
        const totalCount = response.data.totalCount;
        return from(routes).pipe(
          zipWith(interval(1000 / 10)),
          mergeMap(([route]) =>
            this.getRouteSummary(route.id).pipe(
              map((summary) => ({
                details: route,
                numberOfMicrobusesInQueue: summary.numberOfMicrobusesInQueue,
                numberOfMicrobusesOnTheWay: summary.numberOfMicrobusesOnTheWay,
                nearestArrivalMinutes: summary.nearestArrivalMinutes,
              })),
            ),
          ),
          toArray(),
          map((data) => ({ data, totalCount })),
        );
      }),
    );
  }
}
