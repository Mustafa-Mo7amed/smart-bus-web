import { BaseEntity } from './base-entity.model';

export interface Bus extends BaseEntity {
  busId?: string;

  plateNumber: string;

  capacity: number;

  qrCode: string;

  status: 'in_hub' | 'on_route' | 'unavailable';

  stationId: string;
  driverId: string;
}

export interface AddBusRequest {
  plateNumber: string;
  routeId: string;
  passengerCount: number;
  model: string;
  color: string;
}

export interface BusListItem {
  id: string;
  plateNumber: string;
  isActive: boolean;
  passengerCount: number;
  driverName: string;
  routeName: string;
}

export interface BusListPaginated {
  items: BusListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export type GetBusesResponse = BusListPaginated;

export enum BusSearchBy {
  PlateNumber = 'PlateNumber',
  DriverName = 'DriverName',
  Model = 'Model',
  Color = 'Color',
  Route = 'Route',
}

export enum BusSortBy {
  PlateNumber = 'PlateNumber',
  DriverName = 'DriverName',
  PassengerCount = 'PassengerCount',
  RouteName = 'RouteName',
  Model = 'Model',
  Color = 'Color',
}

export interface GetBusesRequest {
  searchBy?: BusSearchBy;
  searchString?: string;
  isActive?: boolean;
  routeId?: string;
  driverId?: string;
  sortBy?: BusSortBy;
  orderOptions?: 'ASC' | 'DESC';
  pageNumber?: number;
  pageSize?: number;
}

export interface BusDetailed {
  id: string;
  plateNumber: string;
  isActive: boolean;
  passengerCount: number;
  model: string;
  color: string;
  qrCode: string;
  routeId: string;
  routeName: string;
  driverId: string;
  driverName: string;
}
