import { User } from './user.model';

export interface Driver extends User {
  driverId: string;
}
