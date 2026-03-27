import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import { MicrobusAtStation, RouteEndpoint, RouteSummary } from '../../shared/models/route.model';

@Injectable({ providedIn: 'root' })
export class RouteApi extends BaseApi {
  constructor() {
    super('Routes');
  }

  getAllRouteSources(): Observable<RouteEndpoint[]> {
    return this.get<RouteEndpoint[]>();
  }

  getRouteDestinations(): Observable<RouteEndpoint[]> {
    return this.get<RouteEndpoint[]>('destinations');
  }

  getRouteSummary(routeId: string): Observable<RouteSummary> {
    return this.get<RouteSummary>(`${routeId}/summary`);
  }

  getMicrobusesAtStation(routeId: string): Observable<MicrobusAtStation[]> {
    return this.get<MicrobusAtStation[]>(`${routeId}/station-microbuses`);
  }  
}
