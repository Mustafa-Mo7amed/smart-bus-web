import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedReports, ReportDetails } from '../../shared/models/report.model';

export interface ReportsFilters {
  plateNumber?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
  status?: 'Pending' | 'Reviewed';
  order?: 'ASC' | 'DESC';
  orderBy?: 'createdAt' | 'resolvedAt';
}

export interface ReviewReportResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class ReportApi extends BaseApi {
  constructor() {
    super('Report/admin');
  }

  getAllReports(filters?: ReportsFilters): Observable<PaginatedReports> {
    let params = new HttpParams();

    if (filters) {
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber);

      if (filters.pageSize) params = params.set('pageSize', filters.pageSize);

      if (filters.plateNumber) params = params.set('plateNumber', filters.plateNumber);

      if (filters.status) params = params.set('status', filters.status);

      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);

      if (filters.toDate) params = params.set('toDate', filters.toDate);

      if (filters.order) params = params.set('order', filters.order);

      if (filters.orderBy) {
        const backendOrderBy = filters.orderBy === 'resolvedAt' ? 'ResolvedAt' : filters.orderBy;
        params = params.set('orderBy', backendOrderBy);
      }
    }

    return this.get<PaginatedReports>('all', params);
  }

  getReportDetails(id: string): Observable<ReportDetails> {
    return this.get<ReportDetails>(id);
  }

  reviewReport(id: string): Observable<ReviewReportResponse> {
    return this.patch(`${id}/status`, { status: 'Reviewed' });
  }
}
