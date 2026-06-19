import { inject, Injectable } from '@angular/core';
import { RouteApi, RoutesFilters, AddRouteRequest, UpdateRouteRequest } from '../api/route.api';
import {
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
  RouteSummary,
} from '../../shared/models/route.model';
import { RouteListItem } from '../../routes/routes-list/routes-list.component';
import { SuccessResponse } from '../api/manager.api';

@Injectable({ providedIn: 'root' })
export class RouteService {
  routeApi = inject(RouteApi);

  getAllRoutes(): Observable<RouteDetailed[]> {
    return this.routeApi.getRoutesPaginated({ pageNumber: 1, pageSize: 10000 }).pipe(map((response) => response.data));
  }

  getRouteById(routeId: string): Observable<RouteDetailed> {
    return this.routeApi.getRouteById(routeId);
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
    filters?: RoutesFilters
  ): Observable<{ data: RouteListItem[]; totalCount: number }> {
    return this.routeApi.getRoutesPaginated(filters).pipe(
      switchMap((response) => {
        const routes = response.data;
        const totalCount = response.totalCount;
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

  addRoute(route: AddRouteRequest): Observable<SuccessResponse> {
    return this.routeApi.addRoute(route);
  }

  updateRoute(route: UpdateRouteRequest): Observable<SuccessResponse> {
    return this.routeApi.updateRoute(route);
  }

  deleteRoute(routeId: string): Observable<SuccessResponse> {
    return this.routeApi.deleteRoute(routeId);
  }
}
