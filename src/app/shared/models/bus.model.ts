import { BaseEntity } from './base-entity.model';

export interface Bus extends BaseEntity {
  busId?: string;

  plateNumber: string;

  capacity: number;

  qrCode: string;

  status: 'in_hub' | 'on_route' | 'unavailable';

  stationId: string;
  driverId: string;
}
