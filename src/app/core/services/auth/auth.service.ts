import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, LoginRequest, User } from '../../../shared/models/auth';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';

  private currentUserSignal = signal<User | null>(null);
  public currentUser = computed(() => this.currentUserSignal());

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>('http://localhost:3000/api/auth/login', data).pipe(tap(response => {
        if (response.token && response.refreshToken) {
            localStorage.setItem(AuthService.TOKEN_KEY, response.token);
            localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, response.refreshToken);
            this.currentUserSignal.set(response.user);
        }
    }));
  }
}
