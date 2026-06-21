import { BaseEntity } from './base-entity.model';

export interface User extends BaseEntity {
  userId: string;
  name: string;
  phone: string;
  password: string;
}

export interface UserInfo {
  id: string;
  displayName: string;
  isActive: boolean;
  isConfirmed: boolean;
  phoneNumber: string;
  roles: string;
  photoUrl?: string | null;
  stationId?: string | null;
  stationName?: string | null;
}

export interface AddManagerRequest {
  displayName: string;
  phoneNumber: string;
  password?: string;
  stationId: string;
}

export interface GetUsersRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  sortBy?: 'Name' | 'Role' | null;
  sortOrder?: 'ASC' | 'DESC' | null;
}

export interface GetUsersResponse {
  data: {
    items: UserInfo[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
  success: boolean;
  message: string;
  statusCode: number;
}

export interface GetUserResponse {
  data: UserInfo;
  success: boolean;
  message: string;
  statusCode: number;
}
