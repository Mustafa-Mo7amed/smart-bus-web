import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import {
  MicrobusAtStation,
  MicrobusOnTheWay,
  RouteEndpoint,
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

  getRouteDestinations(from: string): Observable<RouteEndpoint[]> {
    const params = new HttpParams().set('from', from);
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
}
