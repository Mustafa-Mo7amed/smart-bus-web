import { User } from './user.model';

export interface Passenger extends User {
  passengerId: string;
}
