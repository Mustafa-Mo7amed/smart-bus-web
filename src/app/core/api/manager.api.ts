import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { AddDriverRequest } from '../../shared/models/driver.model';
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
}
