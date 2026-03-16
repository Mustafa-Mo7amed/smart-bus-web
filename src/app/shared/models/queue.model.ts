import { BaseEntity } from './base-entity.model';

export interface Queue extends BaseEntity {
  queueId: string;
  stationId: string;
  routeId: string;
}
