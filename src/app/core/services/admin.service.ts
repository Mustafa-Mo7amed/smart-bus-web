import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminApi } from '../api/admin.api';
import { SuccessResponse } from '../api/manager.api';
import {
  AddManagerRequest,
  GetUsersRequest,
  GetUsersResponse,
  GetUserResponse
} from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly adminApi = inject(AdminApi);

  addManager(manager: AddManagerRequest): Observable<SuccessResponse> {
    return this.adminApi.addManager(manager);
  }

  getUsers(filters?: GetUsersRequest): Observable<GetUsersResponse> {
    return this.adminApi.getUsers(filters);
  }

  getUserById(id: string): Observable<GetUserResponse> {
    return this.adminApi.getUserById(id);
  }

  lockUser(id: string): Observable<SuccessResponse> {
    return this.adminApi.lockUser(id);
  }

  unlockUser(id: string): Observable<SuccessResponse> {
    return this.adminApi.unlockUser(id);
  }
}
