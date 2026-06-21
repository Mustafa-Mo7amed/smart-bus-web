import { BaseEntity } from './base-entity.model';

export interface Station extends BaseEntity {
  stationId: string;
  name: string;
  location: Location;
}

export interface Location {
  latitude: number;
  lonitude: number;
}
