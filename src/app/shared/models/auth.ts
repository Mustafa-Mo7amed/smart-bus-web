export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  role: 'system-admin' | 'district-manager' | 'station-manager';
  name: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}