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

// TODO: update when plate number is included
export interface MicrobusAtStation {
  passengerCount: number;
  model: string;
  color: string;
}

export interface MicrobusOnTheWay {
  estimatedArrivalMinutes: number;
  passengerCount: number;
  model: string;
  color: string;
  driverId: string;
  driverName: string;
  position: number;
  status: string;
  plateNumber: string;
}
