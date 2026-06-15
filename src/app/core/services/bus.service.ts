import { inject, Injectable } from '@angular/core';
import { ManagerApi, SuccessResponse } from '../api/manager.api';
import { Observable } from 'rxjs';
import { AddBusRequest } from '../../shared/models/bus.model';

@Injectable({ providedIn: 'root' })
export class BusService {
  managerApi = inject(ManagerApi);

  addBus(bus: AddBusRequest): Observable<SuccessResponse> {
    return this.managerApi.addBus(bus);
  }
}
