import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import { SuccessResponse } from './manager.api';
import {
  AddManagerRequest,
  GetUsersRequest,
  GetUsersResponse,
  GetUserResponse
} from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminApi extends BaseApi {
  constructor() {
    super('Admin');
  }

  addManager(manager: AddManagerRequest): Observable<SuccessResponse> {
    return this.post('add-manager', manager);
  }

  getUsers(filters?: GetUsersRequest): Observable<GetUsersResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }
    return this.get<GetUsersResponse>('users', params);
  }

  getUserById(id: string): Observable<GetUserResponse> {
    return this.get<GetUserResponse>(`users/${id}`);
  }

  lockUser(id: string): Observable<SuccessResponse> {
    return this.post<SuccessResponse>(`users/${id}/lock`, {});
  }

  unlockUser(id: string): Observable<SuccessResponse> {
    return this.post<SuccessResponse>(`users/${id}/unlock`, {});
  }
}
