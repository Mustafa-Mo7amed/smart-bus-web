import { inject, Injectable, signal } from '@angular/core';
import { AuthApi } from '../api/auth.api';
import { AuthResponse, LoginRequest, RefreshTokenRequest, AuthUser } from '../../shared/models/auth.model';
import { Observable, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authApi = inject(AuthApi);
  
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  private currentUserSignal = signal<AuthUser | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    // Basic session recovery could go here
  }

  private isValidTokenFormat(token: string) {
    return token.split('.').length === 3;
  }

  login(data: LoginRequest) {
    return this.authApi.login(data).pipe(
      tap((response) => {
        if (response.token && response.refreshToken) {
          this.setSession(response);
        }
      }),
    );
  }

  logout() {
    return this.authApi.logout().pipe(
      tap(() => {
        this.clearSession();  
      }),
    );
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    if (!this.isValidTokenFormat(request.token)) {
      return throwError(() => new Error('Invalid token format'));
    }

    return this.authApi.refresh(request).pipe(
      tap((response) => {
        if (response.token && response.refreshToken) {
          this.setSession(response);
        }
      }),
    );
  }

  setSession(response: AuthResponse) {
    localStorage.setItem(AuthService.TOKEN_KEY, response.token);
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, response.refreshToken);
    this.currentUserSignal.set(response.user);
  }

  clearSession() {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
    this.currentUserSignal.set(null);
  }

  getToken() {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  getRefreshToken() {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
