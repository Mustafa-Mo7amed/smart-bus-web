import { inject, Injectable } from '@angular/core';
import { ManagerApi, SuccessResponse } from '../api/manager.api';
import { Observable } from 'rxjs';
import {
  AddStaffRequest,
  UpdateStaffRequest,
  StaffListPaginated,
} from '../../shared/models/staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly managerApi = inject(ManagerApi);

  getStationStaff(filters?: { search?: string; sortOrder?: string; pageNumber?: number; pageSize?: number }): Observable<StaffListPaginated> {
    return this.managerApi.getStationStaff(filters);
  }

  addStaff(staff: AddStaffRequest): Observable<SuccessResponse> {
    return this.managerApi.addStaff(staff);
  }

  updateStaff(id: string, staff: UpdateStaffRequest): Observable<SuccessResponse> {
    return this.managerApi.updateStaff(id, staff);
  }

  deleteStaff(id: string): Observable<SuccessResponse> {
    return this.managerApi.deleteStaff(id);
  }
}
