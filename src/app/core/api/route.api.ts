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
import { SuccessResponse } from './manager.api';

export interface RoutesFilters {
  search?: string;
  sortBy?: 'To' | 'Price' | 'Distance';
  sortOrder?: 'ASC' | 'DESC';
  minPrice?: number;
  maxPrice?: number;
  minDistance?: number;
  maxDistance?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface AddRouteRequest {
  toAr: string;
  toEn: string;
  price: number;
  distanceKm: number;
}

export interface UpdateRouteRequest extends AddRouteRequest {
  routeId: string;
}

@Injectable({ providedIn: 'root' })
export class RouteApi extends BaseApi {
  constructor() {
    super('Routes');
  }

  getAllRouteSources(): Observable<RouteEndpoint[]> {
    return this.get<RouteEndpoint[]>();
  }

  getRoutesPaginated(filters?: RoutesFilters): Observable<RoutesPaginatedResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber);
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.minPrice !== undefined && filters.minPrice !== null) params = params.set('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) params = params.set('maxPrice', filters.maxPrice);
      if (filters.minDistance !== undefined && filters.minDistance !== null) params = params.set('minDistance', filters.minDistance);
      if (filters.maxDistance !== undefined && filters.maxDistance !== null) params = params.set('maxDistance', filters.maxDistance);
    }

    return this.get<RoutesPaginatedResponse>('all', params);
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

  addRoute(route: AddRouteRequest): Observable<SuccessResponse> {
    return this.post('add-route', route);
  }

  updateRoute(route: UpdateRouteRequest): Observable<SuccessResponse> {
    return this.patch('update-route', route);
  }

  deleteRoute(routeId: string): Observable<SuccessResponse> {
    const params = new HttpParams().set('routeId', routeId);
    return this.delete('delete-route', params);
  }
}
