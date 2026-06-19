import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { DriverLocationUpdate } from '../../shared/models/signalr.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DriverApi extends BaseApi {
  constructor() {
    super('Driver');
  }
  
  getDriverLocation(driverId: string): Observable<DriverLocationUpdate> {
    return this.get<DriverLocationUpdate>(`location/${driverId}`);
  }
}
