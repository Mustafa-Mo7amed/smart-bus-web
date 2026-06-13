import { BaseEntity } from './base-entity.model';

export interface Report extends BaseEntity {
  reportId: string;
  tripId?: string;
  userId: string;
  description: string;
  reportType: string;
  reportCreatedAt: string;
}

export interface ReportListItem {
  id: string;
  plateNumber: string;
  createdAt: string;
  reviewedAt: string | null;
  status: 'Pending' | 'Reviewed';
}

export interface ReportDetails {
  passengerName: string;
  driverName: string;
  passangerId: string;
  driverId: string;
  reasons: string[];
  description: string;
  id: string;
  plateNumber: string;
  createdAt: string;
  reviewedAt: string | null;
  status: 'Pending' | 'Reviewed';
}

export interface PaginatedReports {
  items: ReportListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
