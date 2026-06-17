import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import {
  MicrobusAtStation,
  MicrobusOnTheWay,
  RouteDetailed,
  RouteEndpoint,
  RoutesPaginatedResponse,
  RouteSummary,
} from '../../shared/models/route.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RouteApi extends BaseApi {
  constructor() {
    super('Routes');
  }

  getAllRouteSources(): Observable<RouteEndpoint[]> {
    return this.get<RouteEndpoint[]>();
  }

  getRoutesPaginated(pageNumber: number, pageSize: number): Observable<RoutesPaginatedResponse> {
    let params = new HttpParams();
    params = params.set('pageNumber', pageNumber);
    params = params.set('pageSize', pageSize);
    return this.get<RoutesPaginatedResponse>('paginated', params);
  }

  getRouteDestinations(fromStationId: string): Observable<RouteEndpoint[]> {
    const params = new HttpParams().set('fromStationId', fromStationId);
    return this.get<RouteEndpoint[]>('destinations', params);
  }

  getRouteSummary(routeId: string): Observable<RouteSummary> {
    return this.get<RouteSummary>(`${routeId}/summary`);
  }

  getMicrobusesAtStation(routeId: string): Observable<MicrobusAtStation[]> {
    return this.get<MicrobusAtStation[]>(`${routeId}/station-microbuses`);
  }

  getMicrobusesOnTheWay(routeId: string): Observable<MicrobusOnTheWay[]> {
    return this.get<MicrobusOnTheWay[]>(`${routeId}/on-the-way`);
  }

  getRouteById(routeId: string): Observable<RouteDetailed> {
    return this.get<RouteDetailed>(routeId);
  }
}
