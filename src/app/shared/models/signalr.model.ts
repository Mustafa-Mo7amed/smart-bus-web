export interface RouteLiveUpdate {
  numberOfMicrobusesInQueue: number;
  numberOfMicrobusesOnTheWay: number;
  nearestArrivalMinutes: number | null;
}

export interface DriverLocationUpdate {
  driverId: string;
  distance: number;
  duration: number;
  coordinates: number[][];
  lastUpdated: string | null;
}
