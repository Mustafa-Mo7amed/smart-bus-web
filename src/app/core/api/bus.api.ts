import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import { BusDetailed, GetBusesResponse, GetBusesRequest } from '../../shared/models/bus.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BusApi extends BaseApi {
  constructor() {
    super('Microbus');
  }

  getBuses(filters?: GetBusesRequest): Observable<GetBusesResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.searchBy) params = params.set('SearchBy', filters.searchBy);
      if (filters.searchString) params = params.set('SearchString', filters.searchString);
      if (filters.isActive !== undefined && filters.isActive !== null) params = params.set('IsActive', filters.isActive);
      if (filters.routeId) params = params.set('RouteId', filters.routeId);
      if (filters.driverId) params = params.set('DriverId', filters.driverId);
      if (filters.sortBy) params = params.set('SortBy', filters.sortBy);
      if (filters.orderOptions) params = params.set('OrderOptions', filters.orderOptions);
      if (filters.pageNumber) params = params.set('PageNumber', filters.pageNumber);
      if (filters.pageSize) params = params.set('PageSize', filters.pageSize);
    }
    return this.get<GetBusesResponse>('', params);
  }

  getBusById(busId: string): Observable<BusDetailed> {
    return this.get<BusDetailed>(busId);
  }
}
