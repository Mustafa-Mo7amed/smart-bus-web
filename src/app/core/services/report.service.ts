import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { ReportDetails, PaginatedReports } from '../../shared/models/report.model';
import { ReportApi, ReportsFilters, ReviewReportResponse } from '../api/report.api';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly reportApi = inject(ReportApi);

  getReports(filters?: ReportsFilters): Observable<PaginatedReports> {
    return this.reportApi.getAllReports(filters).pipe(delay(filters ? 500 : 0));
  }

  getReportDetails(id: string): Observable<ReportDetails> {
    return this.reportApi.getReportDetails(id);
  }

  reviewReport(id: string): Observable<ReviewReportResponse> {
    return this.reportApi.reviewReport(id);
  }
}
