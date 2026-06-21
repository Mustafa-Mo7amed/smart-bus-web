import { inject, Injectable } from '@angular/core';
import { ManagerApi, SuccessResponse } from '../api/manager.api';
import { BusApi } from '../api/bus.api';
import { Observable } from 'rxjs';
import { AddBusRequest, GetBusesRequest, GetBusesResponse, BusDetailed } from '../../shared/models/bus.model';

@Injectable({ providedIn: 'root' })
export class BusService {
  managerApi = inject(ManagerApi);
  busApi = inject(BusApi);

  addBus(bus: AddBusRequest): Observable<SuccessResponse> {
    return this.managerApi.addBus(bus);
  }

  getStationBuses(filters?: GetBusesRequest): Observable<GetBusesResponse> {
    return this.busApi.getBuses(filters);
  }

  getBusById(id: string): Observable<BusDetailed> {
    return this.busApi.getBusById(id);
  }
}
