import { BaseEntity } from './base-entity.model';

export interface Trip extends BaseEntity {
  tripId: string;
  busId: string;
  routeId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'ongoing' | 'ended';
}
