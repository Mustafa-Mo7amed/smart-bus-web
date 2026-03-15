import { User } from './models/user.model';

export interface Passenger extends User {
  passengerId: string;
}
