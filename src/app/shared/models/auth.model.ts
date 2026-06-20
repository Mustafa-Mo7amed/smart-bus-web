export interface LoginRequest {
  phoneNumber: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  userName: string;
  phone: string;
  token: string;
  expiration: string;
  refreshToken: string;
  refreshTokenExpirationDateTime: string;
  success: boolean;
  message: string;
  statusCode: number;
}

export interface AuthUser{
  id: string;
  displayName: string;
  isActive: string;
  isConfirmed: string;
  phoneNumber: string;
  roles: 'Manager' | 'Admin';
  photoUrl?: string;
  stationId?: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}
