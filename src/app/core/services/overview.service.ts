import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardOverviewResponse } from '../../shared/models/overview.model';
import { ManagerApi } from '../api/manager.api';

@Injectable({ providedIn: 'root' })
export class OverviewService {
  private readonly managerApi = inject(ManagerApi);

  getDashboardOverview(): Observable<DashboardOverviewResponse> {
    return this.managerApi.getDashboardOverview();
  }
}
