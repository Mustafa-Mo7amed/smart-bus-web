import { inject, Injectable } from '@angular/core';
import { AssignDriverBusRequest, ManagerApi, SuccessResponse } from '../api/manager.api';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  managerApi = inject(ManagerApi);

  assignDriverBus(assignment: AssignDriverBusRequest): Observable<SuccessResponse> {
    return this.managerApi.assignDriverBus(assignment);
  }
}
