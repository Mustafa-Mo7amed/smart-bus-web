import { BaseEntity } from './base-entity.model';

export interface Report extends BaseEntity {
  reportId: string;
  tripId?: string;
  userId: string;
  description: string;
  reportType: string;
  reportCreatedAt: string;
}
