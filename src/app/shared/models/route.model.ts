import { BaseEntity } from './base-entity.model';

export interface Route extends BaseEntity {
  routeId: string;
  startCity: string;
  endCity: string;
  routeSummary: RouteSummary;
}

export interface RouteEndpoint {
  cityName?: string;
  to?: string;
  routeId?: string;
}

export interface RouteSummary {
  price: number;
  distanceKm: number;
  numberOfMicrobusesInQueue: number;
  numberOfMicrobusesOnTheWay: number;
  nearestArrivalMinutes: number;
}

export interface RouteDetails extends RouteSummary {
  startCity: string;
  endCity: string;
}

export interface MicrobusAtStation {
  driverId: string;
  driverName: string;
  position: number;
  status: 'OnWay' | 'Waiting';
  plateNumber: string;
  passengerCount: number;
  model: string;
  color: string;
}

export interface MicrobusOnTheWay extends MicrobusAtStation {}