import { inject, Injectable } from '@angular/core';
import { ManagerApi, SuccessResponse } from '../api/manager.api';
import { AddDriverRequest } from '../../shared/models/driver.model';
import { Observable } from 'rxjs';
import { DriverApi } from '../api/driver.api';
import { DriverLocationUpdate } from '../../shared/models/signalr.model';

@Injectable({ providedIn: 'root' })
export class DriverService {
  managerApi = inject(ManagerApi);
  driverApi = inject(DriverApi);

  addDriver(driver: AddDriverRequest): Observable<SuccessResponse> {
    return this.managerApi.addDriver(driver);
  }

  getAllDrivers() {}

  getDriverLocation(driverId: string): Observable<DriverLocationUpdate> {
    return this.driverApi.getDriverLocation(driverId);
  }
}
