import { BaseEntity } from './base-entity.model';

export interface QueueItem extends BaseEntity {
  queueId: string;
  driverId: string;
  busId: string;
  position: number;
  status: 'waiting' | 'loading' | 'departed';
  joinedAt: number;
  leftAt: number;
}
