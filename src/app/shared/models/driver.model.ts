import { User } from './user.model';

export interface Driver extends User {
  driverId: string;
  licenseNumber: string;
}

export interface AddDriverRequest {
  driverName: string;
  phoneNumber: string;
  licenseNumber: string;
}

export interface GetDriverModel {
  to: string;
  from: string;
  passengerCount: number;
  model: string;
  color: string;
  driverId: string;
  driverName: string;
  plateNumber: string;
}

export interface GetDriverResponse {
  data: GetDriverModel;
  success: boolean;
  message: string;
  statusCode: number;
}

export enum DriverSortBy {
  DriverName = 0,
  LicenseNumber = 1,
  PlateNumber = 2
}

export interface GetDriversRequest {
  search?: string;
  sortBy?: DriverSortBy | null;
  sortOrder?: 'ASC' | 'DESC' | null;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetDriversResponse {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  data: GetDriverModel[];
  success: boolean;
  message: string;
  statusCode: number;
}