import { BaseEntity } from './base-entity.model';

export interface User extends BaseEntity {
  userId: string;
  name: string;
  phone: string;
  password: string;
}
