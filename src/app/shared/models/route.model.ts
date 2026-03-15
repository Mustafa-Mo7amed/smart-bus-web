import { BaseEntity } from './base-entity.model';

export interface Route extends BaseEntity {
  routeId: string;
  startCity: string;
  endCity: string;
  officialPrice: number;
}
