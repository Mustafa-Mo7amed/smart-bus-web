import { Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RefreshTokenRequest } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi extends BaseApi {
  constructor() {
    super('Account');
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('login', data);
  }

  logout(): Observable<AuthResponse> {
    return this.post<AuthResponse>('logout', {});
  }

  refresh(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('generate-new-jwt-token', request);
  }
}