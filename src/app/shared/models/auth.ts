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
  role: 'admin' | 'manager';
  name: string;
}
