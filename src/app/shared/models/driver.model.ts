import { User } from './user.model';

export interface Driver extends User {
  driverId: string;
  licenseNumber: string;
}

export interface AddDriverRequest {
  driverName: string;
  phoneNumber: string;
  licenseNumber: string;
}
