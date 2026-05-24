import { inject, Injectable } from '@angular/core';
import { ManagerApi, SuccessResponse } from '../api/manager.api';
import { AddDriverRequest } from '../../shared/models/driver.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DriverService {
  managerApi = inject(ManagerApi);

  addDriver(driver: AddDriverRequest): Observable<SuccessResponse> {
    return this.managerApi.addDriver(driver);
  }

  getAllDrivers() {}
}
