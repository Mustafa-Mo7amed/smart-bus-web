import { BaseEntity } from './base-entity.model';

export interface Location {
  latitude: number;
  lonitude: number;
}

export interface Station extends BaseEntity {
  stationId: string;
  name: string;
  location: Location;
}

export interface StationInfo {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
}

export interface SaveStationRequest {
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
  addressAr: string;
  addressEn: string;
}
