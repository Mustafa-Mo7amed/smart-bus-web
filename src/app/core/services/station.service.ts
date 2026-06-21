import { inject, Injectable } from '@angular/core';
import { StationApi } from '../api/station.api';
import { Observable } from 'rxjs';
import { StationInfo, SaveStationRequest } from '../../shared/models/station.model';
import { SuccessResponse } from '../api/manager.api';

@Injectable({ providedIn: 'root' })
export class StationService {
  private readonly stationApi = inject(StationApi);

  getStations(): Observable<StationInfo[]> {
    return this.stationApi.getStations();
  }

  getStationById(id: string): Observable<StationInfo> {
    return this.stationApi.getStationById(id);
  }

  addStation(station: SaveStationRequest): Observable<SuccessResponse> {
    return this.stationApi.addStation(station);
  }

  updateStation(id: string, station: SaveStationRequest): Observable<SuccessResponse> {
    return this.stationApi.updateStation(id, station);
  }

  deleteStation(id: string): Observable<SuccessResponse> {
    return this.stationApi.deleteStation(id);
  }
}
