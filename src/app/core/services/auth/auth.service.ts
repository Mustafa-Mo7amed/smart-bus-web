import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, LoginRequest, RefreshTokenRequest, User } from '../../../shared/models/auth';
import { Observable, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  private isValidTokenFormat(token: string) {
    return token.split('.').length === 3;
  }

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>('http://localhost:3000/api/auth/login', data).pipe(
      tap((response) => {
        if (response.token && response.refreshToken) {
          this.setSession(response);
        }
      }),
    );
  }

  logout() {
    return this.http.post<AuthResponse>('http://localhost:3000/api/auth/logout', {}).pipe(
      tap(() => {
        this.clearSession();  
      }),
    );
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    if (this.isValidTokenFormat(request.token)) {
      return throwError(() => new Error('Invalid token format'));
    }

    return this.http.post<AuthResponse>('http://localhost:3000/api/auth/refresh', request).pipe(
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
}
