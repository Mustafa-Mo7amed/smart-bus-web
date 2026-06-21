import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import { StationInfo, SaveStationRequest } from '../../shared/models/station.model';
import { SuccessResponse } from './manager.api';

@Injectable({ providedIn: 'root' })
export class StationApi extends BaseApi {
  constructor() {
    super('Stations');
  }

  getStations(): Observable<StationInfo[]> {
    return this.get<StationInfo[]>();
  }

  getStationById(id: string): Observable<StationInfo> {
    return this.get<StationInfo>(id);
  }

  addStation(station: SaveStationRequest): Observable<SuccessResponse> {
    return this.post<SuccessResponse>('', station);
  }

  updateStation(id: string, station: SaveStationRequest): Observable<SuccessResponse> {
    return this.put<SuccessResponse>(id, station);
  }

  deleteStation(id: string): Observable<SuccessResponse> {
    return this.delete<SuccessResponse>(id);
  }
}
