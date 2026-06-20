import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BaseApi } from './base.api';
import {
  AddDriverRequest,
  GetDriversResponse,
  GetDriversRequest,
  DriverHistoryResponse,
  DriverHistoryRequest,
} from '../../shared/models/driver.model';
import { Observable } from 'rxjs';
import { AddBusRequest } from '../../shared/models/bus.model';
import { DashboardOverviewResponse } from '../../shared/models/overview.model';

export interface AssignDriverBusRequest {
  driverId: string;
  microbusId: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
}

@Injectable({ providedIn: 'root' })
export class ManagerApi extends BaseApi {
  constructor() {
    super('Manager');
  }

  addDriver(driver: AddDriverRequest): Observable<SuccessResponse> {
    return this.post('add-driver', driver);
  }

  addBus(bus: AddBusRequest): Observable<SuccessResponse> {
    return this.post('add-microbus', bus);
  }

  // TODO: should return a QR code not a SuccessResponse
  assignDriverBus(assignment: AssignDriverBusRequest): Observable<SuccessResponse> {
    return this.post('assign-driver-microbus', assignment);
  }

  getDashboardOverview(): Observable<DashboardOverviewResponse> {
    return this.get<DashboardOverviewResponse>('dashboard/overview');
  }

  getStationDrivers(filters?: GetDriversRequest): Observable<GetDriversResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('Search', filters.search);
      if (filters.sortBy !== undefined && filters.sortBy !== null) params = params.set('SortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('SortOrder', filters.sortOrder);
      if (filters.pageNumber) params = params.set('PageNumber', filters.pageNumber);
      if (filters.pageSize) params = params.set('PageSize', filters.pageSize);
    }
    return this.get<GetDriversResponse>('station-drivers', params);
  }

  getDriverTripHistor(driverId: string, request?: DriverHistoryRequest): Observable<DriverHistoryResponse> {
    let params = new HttpParams();
    if (request) {
      if (request.fromDate) params = params.set('FromDate', request.fromDate);
      if (request.toDate) params = params.set('ToDate', request.toDate);
      if (request.pageNumber) params = params.set('PageNumber', request.pageNumber);
      if (request.pageSize) params = params.set('PageSize', request.pageSize);
    }
    return this.get<DriverHistoryResponse>(`${driverId}/driver-history`, params);
  }
}
