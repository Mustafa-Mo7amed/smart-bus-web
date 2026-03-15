import { BaseEntity } from './base-entity.model';

export interface Trip extends BaseEntity {
  tripId: string;
  busId: string;
  routeId: string;
  startTime: number;
  endTime: number;
  status: 'pending' | 'ongoing' | 'ended';
}
