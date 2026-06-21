import { inject, Injectable } from '@angular/core';
import { BaseApi } from './base.api';
import { Observable } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest, RefreshTokenRequest } from '../../shared/models/auth.model';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { SuccessResponse } from './manager.api';

@Injectable({ providedIn: 'root' })
export class AuthApi extends BaseApi {
  private readonly httpBackend = inject(HttpBackend);
  private readonly cleanHttp = new HttpClient(this.httpBackend);

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
    return this.cleanHttp.post<AuthResponse>(this.buildUrl('generate-new-jwt-token'), request);
  }

  getMe(): Observable<AuthUser> {
    return this.get<AuthUser>('me');
  }

  uploadPhoto(formData: FormData): Observable<SuccessResponse> {
    return this.patch<SuccessResponse>('upload-photo', formData);
  }

  deletePhoto(): Observable<SuccessResponse> {
    return this.delete<SuccessResponse>('delete-photo');
  }

  deleteAccount(): Observable<SuccessResponse> {
    return this.delete<SuccessResponse>('delete');
  }
}
