import { BaseEntity } from './base-entity.model';
import { QueueItem } from './queue-item.model';

export interface Queue extends BaseEntity {
  queueId: string;
  stationId: string;
  routeId: string;
  items: QueueItem[];
}
