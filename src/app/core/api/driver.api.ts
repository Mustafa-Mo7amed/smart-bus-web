import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { DriverLocationUpdate } from '../../shared/models/signalr.model';
import { Observable } from 'rxjs';
import { GetDriverResponse } from '../../shared/models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverApi extends BaseApi {
  constructor() {
    super('Driver');
  }

  getDriverById(driverId: string): Observable<GetDriverResponse> {
    return this.get<GetDriverResponse>(driverId);
  }

  getDriverByLicense(license: string): Observable<GetDriverResponse> {
    return this.get<GetDriverResponse>(license);
  }
  
  getDriverLocation(driverId: string): Observable<DriverLocationUpdate> {
    return this.get<DriverLocationUpdate>(`location/${driverId}`);
  }
}
