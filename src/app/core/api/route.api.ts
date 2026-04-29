import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable, of } from 'rxjs';
import {
  MicrobusAtStation,
  MicrobusOnTheWay,
  RouteDetails,
  RouteEndpoint,
  RouteSummary,
} from '../../shared/models/route.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RouteApi extends BaseApi {
  constructor() {
    super('Routes');
  }

  getAllRouteSources(): Observable<RouteEndpoint[]> {
    return this.get<RouteEndpoint[]>();
  }

  getRouteDestinations(fromStationId: string): Observable<RouteEndpoint[]> {
    const params = new HttpParams().set('fromStationId', fromStationId);
    return this.get<RouteEndpoint[]>('destinations', params);
  }

  getRouteSummary(routeId: string): Observable<RouteSummary> {
    return this.get<RouteSummary>(`${routeId}/summary`);
  }

  getMicrobusesAtStation(routeId: string): Observable<MicrobusAtStation[]> {
    // TODO: remove dummy data when api is ready
    if (true) {
      const dummyData: MicrobusAtStation[] = [
        {
          driverId: 'D001',
          driverName: 'Ahmed Hassan',
          position: 1,
          status: 'Waiting',
          plateNumber: '123 م ح ب',
          passengerCount: 25,
          model: 'Toyota Hiace',
          color: 'White',
        },
        {
          driverId: 'D002',
          driverName: 'Mohamed Ali',
          position: 2,
          status: 'Waiting',
          plateNumber: '789 م ك ر',
          passengerCount: 18,
          model: 'Mercedes Sprinter',
          color: 'Blue',
        },
        {
          driverId: 'D003',
          driverName: 'Omar Khaled',
          position: 3,
          status: 'Waiting',
          plateNumber: '456 م و ر',
          passengerCount: 30,
          model: 'Hyundai H350',
          color: 'Gray',
        },
      ];
      return of(dummyData);
    }
    return this.get<MicrobusAtStation[]>(`${routeId}/station-microbuses`);
  }

  getMicrobusesOnTheWay(routeId: string): Observable<MicrobusOnTheWay[]> {
    // TODO: remove dummy data when api is ready
    if (true) {
      const dummyData: MicrobusOnTheWay[] = [
        {
          driverId: 'D001',
          driverName: 'Ahmed Hassan',
          position: 5,
          status: 'OnWay',
          plateNumber: '123 ن أ ر',
          passengerCount: 28,
          model: 'Toyota Hiace',
          color: 'White',
        },
        {
          driverId: 'D002',
          driverName: 'Mohamed Ali',
          position: 3,
          status: 'OnWay',
          plateNumber: '789 ن ي ر',
          passengerCount: 22,
          model: 'Mercedes Sprinter',
          color: 'Blue',
        },
      ];
      return of(dummyData);
    }
    return this.get<MicrobusOnTheWay[]>(`${routeId}/on-the-way`);
  }

  getRouteDetails(routeId: string): Observable<RouteDetails> {
    // TODO: remove dummy data when api is ready
    if (true) {
      const dummyData: RouteDetails = {
        startCity: 'Minya',
        endCity: 'Mallawi',
        price: 25,
        distanceKm: 15.5,
        numberOfMicrobusesInQueue: 3,
        numberOfMicrobusesOnTheWay: 2,
        nearestArrivalMinutes: 5,
      };
      return of(dummyData);
    }
    return this.get<RouteDetails>(`${routeId}/route-details`);
  }
}
